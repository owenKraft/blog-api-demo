const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs')

const passportJWT = require("passport-jwt");
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;

const jwtSecretKey = process.env.JWT_SECRET_KEY
const User = require('../models/user')

passport.use(
    new LocalStrategy((username, password, done) => {
        User.findOne({username: username}, (err, user) => {
            if(err){
                return done(err)
            }

            if(!user){
                return done(null, false, {message: 'Incorrect username'})
            }

            bcrypt.compare(password, user.password, (err, res) => {
                if(res){
                    return done(null, user)
                } else {
                    return done(null, false, {message: 'Incorrect password'})
                }
            })
        })
    })
)

passport.serializeUser((user, done) => {
    done(null, user.id)
})

passport.deserializeUser((id, done) => {
    User.findById(id, (err,user) => {
        done(err, user)
    })
})

passport.use(new JWTStrategy({
        jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
        secretOrKey : jwtSecretKey
    },
    function (jwtPayload, cb) {

        //find the user in db if needed. This functionality may be omitted if you store everything you'll need in JWT payload.
        return User.findOneById(jwtPayload.id)
            .then(user => {
                return cb(null, user);
            })
            .catch(err => {
                return cb(err);
            });
    }
));