const passport = require('passport');
const { BasicStrategy } = require('passport-http');
const boom = require('@hapi/boom'); //Para el manejo de errores
const axios = require('axios');//Permite hacer request a otros servidores en nuestro caso a API Server

require('dotenv').config();

passport.use(new BasicStrategy(async (email, password, cb) => {

  try {
    //Obtenemos la data y el status de mi peticion de axios
    const { data, status } = await axios({
      url: `${process.env.API_URL}/api/auth/sign-in`, //url al que vamos hacer el request
      method: 'post',
      auth: { //En el cuerpo de auth
        password,
        username: email, //Estos datos nos van a llegar del FRONTEND
      },
      data: { //Lo otro que se debe enviar en el cuerpo
        apiKeyToken: process.env.API_KEY_TOKEN, //LE DEBEMOS ENVIAR UN APIkEYtOKEN PARA QUE NOS DEVUELVA UN TOKEN CON LOS SCOPES
      },
    });
    if (!data || status !== 200) { //200 status de "OK"
      return cb(boom.unauthorized(), false);
    }

    return cb(null, data); //retornamos error=null y la data

  } catch (error) {
    return cb(error);
  }
}));
