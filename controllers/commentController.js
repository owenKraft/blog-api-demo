const Post = require('../models/post')
const User = require('../models/user')
const Comment = require('../models/comment')

const utilities = require('../utilities/utilities')

const async = require('async')
const {body,validationResult} = require('express-validator')
const passport = require('passport')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const jwtSecretKey = process.env.JWT_SECRET_KEY

exports.retrieve_comments = (req, res, next) => {
    if (req.header('Content-Type') == 'application/json') {
        return res.send('Received a GET request for retrieve_comments')
      } else {
        // return res.render('users-index', { users: users });
        res.redirect('/')
      }
}

exports.create_comment = [
    body('comment', 'A comment is required').trim().isLength({min: 1}).escape(),

    (req, res, next) => {
        if (req.header('Content-Type') == 'application/json') {
            return res.send('Received a POST request for create_post')
        } else {
            jwt.verify(req.cookies.token, jwtSecretKey, (err, userData) => {
                if(err){
                    res.sendStatus(403)
                } else {
                    const errors = validationResult(req)

                    const token = utilities.parseJwt(req.cookies.token)

                    async.parallel({
                        user: (cb) => {
                            User.findOne({'username': token.username}).exec(cb)
                        },
                        post: (cb) => {
                            Post.findOne({_id: req.body.postId}).exec(cb)
                        },
                    }, (err, results) => {
                        const comment = new Comment(
                            {
                                author: results.user._id,
                                post: results.post._id,
                                text: req.body.comment,
                                timestamp: utilities.formatDate(new Date())
                            }
                        )
            
                        if(!errors.isEmpty()){
                            console.log('failure!')

                            res.render('post', {post: results.post, token: token, errors: errors.array()})
                        } else {
                            comment.save(err => {
                                    if(err){
                                        return next(err)
                                    } 
                                    console.log('success!')

                                    res.redirect('/posts/'+req.body.postId)
                            })
                        }
                    })
                }
            }) 
        }
    }
]

exports.read_comment = (req, res, next) => {
    res.render('/')
}

exports.update_comment = (req, res, next) => {
    res.render('/')
}

exports.delete_comment = (req, res, next) => {
    res.render('/')
}