const passport = require("passport");
const boom = require('@hapi/boom'); //Para el manejo de errores
const axios = require('axios')//Permite hacer request a otros servidores en nuestro caso a API Server
const { get } = require('lodash') //Para poder obtener un valor de un objeto
const { Strategy: TwitterStrategy } = require('passport-twitter')
const { config } = require('../../../config');

passport.use( //Creamos la estrategia
    new TwitterStrategy({
        consumerKey: config.twitterConsumerKey,
        consumerSecret: config.twitterConsumerSecret,
        callbackURL: "/auth/twitter/callback",
        includeEmail: true
    }, async function(token,tokenSecret, profile, cb){
        const { data,status } = await axios({ //Hacemos un request
            url: `${config.apiUrl}/api/auth/sign-provider`,
            method:'post',
            data:{
                name: profile.displayName,
                email: get(profile,'emails.0.value', `${profile.username}@twitter.com`), //El 0 hace referencia a una posicion
                password: profile.id,
                apiKeyToken: config.apiKeyToken
            }, 
            
        })
        if(!data || status !== 200){ //Validadndo si hay un error
            return cb(boom.unauthorized(), false);
        }
        return cb(null, data)
    })
)