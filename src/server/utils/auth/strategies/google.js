const passport = require("passport");
const boom = require('@hapi/boom'); //Para el manejo de errores
const axios = require('axios')//Permite hacer request a otros servidores en nuestro caso a API Server
const { OAuth2Strategy: GoogleStrategy } = require("passport-google-oauth");

const { config } = require("../../../config");


passport.use(
  new GoogleStrategy(
    {
      clientID: config.googleClientId,
      clientSecret: config.googleClientSecret,
      callbackURL: "/auth/google/callback"
    },
    async function(accessToken, refreshToken, { _json: profile }, cb) {
        try {
            const { data, status } = await axios({
                url: `${config.apiUrl}/api/auth/sign-provider`,
                method: "post",
                data: {
                    name: profile.name,
                    email: profile.email,
                    password: profile.sub,
                    apiKeyToken: config.apiKeyToken
                }
            });

            if (!data || status !== 200) {
                return cb(boom.unauthorized(), false);
            }

            return cb(null, data);

        } catch (error) {
            return cb(err)
        }
      

      

      
    }
  )
);