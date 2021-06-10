const passport = require('passport');
const { Strategy: FacebookStrategy } = require('passport-facebook');
const boom = require('@hapi/boom');
const { get } = require('lodash') //Para poder obtener un valor de un objeto
const axios = require('axios');
const { config } = require('../../../config');

passport.use(new FacebookStrategy({
  clientID: config.facebookClientId,
  clientSecret: config.facebookClientSecret,
  callbackURL: '/auth/facebook/callback',
  profileFields: ['id', 'displayName', 'email']
},
async (accessToken, refreshToken, profile, cb) => {
  console.log(profile);
  const { data, status } = await axios({
    url: `${config.apiUrl}/api/auth/sign-provider`,
    method: 'post',
    data: {
      name: profile.displayName,
      email: get(profile,'email.0.value', `${profile.username}@facebook.com`), //El 0 hace referencia a una posicion
      password: profile.id,
      apiKeyToken: config.apiKeyToken
    }
  });

  if(!data || status !== 200){
    return cb(boom.unauthorized(), false);
  }

  return cb(null, data);
}
));