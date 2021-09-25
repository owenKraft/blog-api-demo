const Post = require('../models/post')
const User = require('../models/user')
const Comment = require('../models/comment')

const async = require('async')
const {body,validationResult} = require('express-validator')
const passport = require('passport')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const jwtSecretKey = process.env.JWT_SECRET_KEY

exports.register = (req, res, next) => {
    res.render('register', {user: req.user})
}

exports.login_get = (req, res, next) => {
    res.render('login', {user: req.user})
}

exports.login_post = (req, res, next) => {
    if (req.header('Content-Type') == 'application/json') {
        const user = {
            id: 1,
            username: testing
        }
    
        jwt.sign({user}, jwtSecretKey, (err, token) => {
            res.json({
                token
            })
        })
    } else {
        passport.authenticate('local', (err,user,info) => {
            if (err || !user) {
                return res.status(400).json({
                    message: 'Something is not right',
                    err: err,
                    user : user
                });
            }
    
            req.login(user, (err) => {
                if (err) {
                    return res.send(err);
                }

                const token = jwt.sign(user.toJSON(), jwtSecretKey);

                res.cookie('token', token, { httpOnly: true})
        
                res.redirect('/')
            })
        })(req,res,next)
    }
}

exports.logout = (req,res,next) => {
    res.clearCookie('token')
    res.redirect('/')
}

exports.retrieve_users = (req, res, next) => {
    if (req.header('Content-Type') == 'application/json') {
        return res.send('Received a GET request for retrieve_users')
    } else {
        res.redirect('/')
    }
}

exports.create_user = (req, res, next) => {
    if (req.header('Content-Type') == 'application/json') {
        return res.send('Received a POST request for create_users')
    } else {
        bcrypt.hash(req.body.password, 10, (err, hashedPassword) => {
            if(err){
                return next(err)
            }

            User.findOne({username: req.body.username}, (err,result) => {
                if(result === null){
                    const user = new User({
                        username: req.body.username,
                        password: hashedPassword,
                        role: 'member'
                    }).save().then(user => {
                        const token = jwt.sign(user.toJSON(), jwtSecretKey);

                        res.cookie('token', token, { httpOnly: true})
    
                        return res.redirect('/')
                    })
                } else {
                    console.log('user already exists')

                    return res.render('register', {alreadyExists: true, user: false})
                }
            })
        })
    }
}

exports.read_user = (req, res, next) => {
    res.redirect('/')
}

exports.update_user = (req, res, next) => {
    res.redirect('/')
}

exports.delete_user = (req, res, next) => {
    res.redirect('/')
}