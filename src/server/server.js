/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable global-require */
import express from 'express';
import dotenv from 'dotenv';
import webpack from 'webpack';
import helmet from 'helmet';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { renderRoutes } from 'react-router-config';
import { StaticRouter } from 'react-router-dom';
import cookieParser from 'cookie-parser';
import boom from '@hapi/boom';
import passport from 'passport';
import axios from 'axios';
import reducer from '../frontend/reducers';
import serverRoutes from '../frontend/routes/serverRoutes';
import getManifest from './getManifest';

dotenv.config();
const app = express();
const { ENV, PORT } = process.env;

app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());

require('./utils/auth/strategies/basic');

if (ENV === 'development') {
  console.log('Development config');
  const webpackConfig = require('../../webpack.config');
  const webpackDevMiddleware = require('webpack-dev-middleware');
  const webpackHotMiddleware = require('webpack-hot-middleware');
  const compiler = webpack(webpackConfig);
  // const serverConfig = {
  //     port: PORT,
  //     hot: true
  // }

  const serverConfig = { serverSideRender: true };

  app.use(webpackDevMiddleware(compiler, serverConfig));
  app.use(webpackHotMiddleware(compiler));

} else {
  app.use((req, res, next) => {
    if (!req.hashManifest) req.hashManifest = getManifest();
    next();
  });
  app.use(express.static(`${__dirname}/public`));
  app.use(helmet());
  app.use(helmet.permittedCrossDomainPolicies());
  app.disable('x-powered-by');
}

const setResponse = (html, preloadedState, manifest) => {
  const mainStyles = manifest ? manifest['main.css'] : 'assets/app.css';
  const mainBuild = manifest ? manifest['main.js'] : 'assets/app.js';
  const vendorBuild = manifest ? manifest['vendors.js'] : 'assets/vendor.js';

  return (
    `
        <!DOCTYPE html>
        <html>
        <head>
            <link rel="stylesheet" href="${mainStyles}" type="text/css">
            <title>Platzi Video</title>
        </head>
        <body>
            <div id="app">${html}</div>
            <script>
                window.__PRELOADED_STATE__= ${JSON.stringify(preloadedState).replace(/</g, '\\u003c')}
            </script>
            <script src="${mainBuild}" type="text/javascript"></script>
            <script src="${vendorBuild}" type="text/javascript"></script>
        </body>
        </html>
    `
  );
};

const renderApp = async (req, res) => {
  let initialState;
  const { token, email, name, id } = req.cookies; //Se lee las cookies de nuestro navegador
  try {
    let movieList = await axios({
      url: `${process.env.API_URL}/api/movies`,
      headers: { Authorization: `Bearer ${token}` },
      method: 'get',
    });
    movieList = movieList.data.data;
    let userMovieList = await axios({
      url: `${process.env.API_URL}/api/user-movies/?userId=${id}`,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    userMovieList = userMovieList.data.data;
    initialState = {
      user: {
        id, email, name,
      },
      myList:
      movieList.filter((movie) => {
        return userMovieList.some(
          (userMovie) => movie._id === userMovie.movieId,
        );
      }).map((movie) => {
        const filteredMovie = userMovieList.find((userMovie) => movie._id === userMovie.movieId);
        if (filteredMovie) {
          // aquí agrego el userMoviId que luego lo usaré para borrar favoritos
          // eslint-disable-next-line no-param-reassign
          movie.userMovieId = filteredMovie._id;
        }
        return movie;
      }),
      trends: movieList.filter((movie) => movie.contentRating === 'PG' && movie._id),
      originals: movieList.filter((movie) => movie.contentRating === 'G' && movie._id),
    };
  } catch (error) {
    initialState = {
      user: {},
      myList: [],
      trends: [],
      originals: [],
    };
  }

  const store = createStore(reducer, initialState);
  const preloadedState = store.getState();
  const isLogged = (initialState.user.id);
  const html = renderToString(
    <Provider store={store}>
      <StaticRouter location={req.url} context={{}}>
        {renderRoutes(serverRoutes(isLogged))}
      </StaticRouter>
    </Provider>,
  );

  res.send(setResponse(html, preloadedState, req.hashManifest));

};

app.post('/auth/sign-in', async (req, res, next) => {
  // Obtenemos el atributo rememberMe desde el cuerpo del request
  // const { rememberMe } = req.body;
  passport.authenticate('basic', (error, data) => {
    try {
      if (error || !data) {
        next(boom.unauthorized());
      }

      req.login(data, { session: false }, async (err) => {
        if (err) {
          next(err);
        }

        const { token, ...user } = data;

        //definimos una cookie en nuestro objeto request. La cookie se va llamar token y recibe el token y se define algunas propiedades
        res.cookie('token', token, {
          httpOnly: !(ENV === 'development'),
          secure: !(ENV === 'development'),
        });

        res.status(200).json(user);
        //Nota: El proceso de sign-in de nuestro render server hace: crea la cookie y en la cookie insertamos el token y como respuesta nos devuelve el usuario
      });
    } catch (error) {
      next(error);
    }
  })(req, res, next);
});

app.post('/auth/sign-up', async (req, res, next) => {
  const { body: user } = req;
  try {
    const userData = await axios({
      url: `${process.env.API_URL}/api/auth/sign-up`,
      method: 'post',
      data: {
        'email': user.email,
        'name': user.name,
        'password': user.password,
      },
    });
    res.status(201).json({
      name: req.body.name,
      email: req.body.email,
      id: userData.data.id,
    });
  } catch (error) {
    next(error);
  }
});

// eslint-disable-next-line consistent-return
app.post('/user-movies', async (req, res, next) => {
  try {
    const { body: userMovie } = req; //del body sacamos el UserMovie
    const { id, token } = req.cookies; //Sacamos el token del cookie
    console.log(req.userMovie);
    console.log(userMovie);
    const response = await axios({
      url: `${process.env.API_URL}/api/user-movies`,
      headers: { Authorization: `Bearer ${token}` },
      method: 'post',
      data: {
        userId: id,
        movieId: userMovie.movieId,
      },
    }); //Hacemos un request de tipo post enviando las peliculas de usuario

    res.status(200).json(response.data);
  } catch (error) {
    next(error);
  }

});

app.delete('/user-movies/:userMovieId', async (req, res, next) => {
  const { userMovieId } = req.params;
  const { token } = req.cookies;

  try {
    const response = await axios({
      url: `${process.env.API_URL}/api/user-movies/${userMovieId}`,
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    res.status(200).json(response.data);
  } catch (error) {
    next(error);
  }
});

app.get('*', renderApp);

app.listen(PORT, (err) => {
  if (err) {
    console.log(err);
  } else {
    console.log(`Server running on port ${PORT}`);
  }
});
