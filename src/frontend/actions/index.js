import axios from 'axios';

export const setFavoriteRequest = (payload) => ({
  type: 'SET_FAVORITE',
  payload,
});

export const deleteFavoriteRequest = (payload) => ({
  type: 'DELETE_FAVORITE',
  payload,
});

export const loginRequest = (payload) => ({
  type: 'LOGIN_REQUEST',
  payload,
});

export const logoutRequest = (payload) => ({
  type: 'LOGOUT_REQUEST',
  payload,
});

export const registerRequest = (payload) => ({
  type: 'REGISTER_REQUEST',
  payload,
});

export const getVideoSource = (payload) => ({
  type: 'GET_VIDEO_SOURCE',
  payload,
});

export const setError = (payload) => ({
  type: 'SET_ERROR',
  payload,
});

export const registerUser = (payload, redirectUrl) => { //Aca retornamos una funcion que hace un llamado a una API para registrar usuario
  //Despues que termine de hacer ese procesamiento, nos retorna la data
  //Si redux thunk identificca que un actions no tiene una funcion, NO hace nada
  return (dispatch) => {
    axios.post('/auth/sign-up', payload)
      .then(({ data }) => dispatch(registerRequest(data))) //Disparamos otra accion con la data que nos devuelve la peticion previa.
      .then(() => { //Validacion para verificar si lo anterior sucedio
        window.location.href = redirectUrl; //Si ya sucedio que nos redireccione a esa direccion
      })
      .catch((error) => dispatch(setError(error)));
  };
};

export const loginUser = ({ email, password }, redirectUrl) => {
  return (dispatch) => {
    axios({
      url: '/auth/sign-in/',
      method: 'post',
      auth: {
        username: email,
        password,
      },
    })
      .then(({ data }) => {
        console.log(data);
        document.cookie = `email=${data.user.email}`;//Guardamos en la cookie
        document.cookie = `name=${data.user.name}`;
        document.cookie = `id=${data.user.id}`;
        // document.cookie = `token=${data.user.token}`;
        dispatch(loginRequest(data.user));
      })
      .then(() => {
        window.location.href = redirectUrl;
      })
      .catch((err) => dispatch(setError(err)));
  };
};

export const setFavorite = (_id, cover, title, year, contentRating, duration) => {
  console.log(_id);
  return (dispatch) => {
    axios({
      url: '/user-movies',
      method: 'POST',
      data: {
        movieId: _id,
      },
    })
      .then(() => {
        dispatch(
          setFavoriteRequest({
            _id,
            cover,
            title,
            year,
            contentRating,
            duration,
          }),
        );
      })
      .catch((err) => dispatch(setError(err)));
  };
};

export const deleteFavorite = (userMovieId) => {
  return (dispatch) => {
    axios({
      url: `/user-movies/${userMovieId}`,
      method: 'DELETE',
    })
      .then(() => {
        dispatch(deleteFavoriteRequest(userMovieId));
      })
      .catch((err) => dispatch(setError(err)));
  };
};

export { setFavorite as default };
