const passport = require('passport')
const axios = require('axios')//Permite hacer request a otros servidores en nuestro caso a API Server
const { OAuth2Strategy } = require('passport-oauth')
const boom = require('@hapi/boom'); //Para el manejo de errores
const { config } = require('../../../config');

//LINKS QUE HACEN PARTE DEL FLUJO DE OAUTH DE GOOGLE
const GOOGLE_AUTHORIZATION_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://www.googleapis.com/oauth2/v4/token';
const GOOGLE_URSERINFO_URL = 'https://www.googleapis.com/oauth2/v3/userinfo';

const oAuth2Strategy = new OAuth2Strategy({  //Generamos nuestra estrategia de Open Authorization
    authorizationURL:  GOOGLE_AUTHORIZATION_URL,
    tokenURL: GOOGLE_TOKEN_URL,
    clientID: config.googleClientId ,
    clientSecret: config.googleClientSecret,
    callbackURL: "/auth/google-oauth/callback" //En el proceso de la autorizacion request siempre va haber un callbackURL

}, async function(accessToken, refreshToken, profile, cb){ //Recibimos los siguientes parametros
    const { data, status } = await axios({//Hacemos un request a nuestra API
        url:`${config.apiUrl}/api/auth/sign-provider`,
        method: 'post',
        data: {
            name: profile.name,  //El Profile nos lo va dar Google pero debemos implementar como nos lo va entregar
            email: profile.email,
            password: profile.id,
            apiKeyToken: config.apiKeyToken
        }
    });

    console.log(data);

    if(!data || status !==200){
        return cb(boom.unauthorized(), false)
    }

    return cb(null, data)

})

//Implementamos como Oauth va definir nuestro Profile
oAuth2Strategy.userProfile = function( accessToken, done){   //Definimos la funcion que va devolver hnuestro perfil            callback "done"
    console.log(accessToken);
    this._oauth2.get(GOOGLE_URSERINFO_URL, accessToken, (err, body) => {  //Hacemos una solicitud GET
        if(err){
            return done(err)
        }

        try {
            const { sub, name, email } = JSON.parse(body);  //Sacamos del Body

            const profile = {  //Construimos un PROFILE
                id: sub,
                name,
                email
            };

            done(null, profile) //Devolvemos el profile y un null como error
        } catch (parseError) {
            return done(parseError)
        }
    })

}

passport.use("google-oauth", oAuth2Strategy) //definimos que passport utiliza la autenticacion tipo "google-oauth"