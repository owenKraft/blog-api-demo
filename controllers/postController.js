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
const sanitizeUrl = require("@braintree/sanitize-url").sanitizeUrl;

exports.retrieve_posts = (req, res, next) => {
    let token
    if(req.cookies.token){
        token = utilities.parseJwt(req.cookies.token)
    } else {
        token = ''
    }

    async.parallel({
        posts: (cb) => {
            Post.find().populate('author').exec(cb)
        },
        comments: (cb) => {
            Comment.find().populate('post').exec(cb)
        }
    }, (err, results) => {
        if(err){ return next(err) }

        let posts

        if(results.posts===null){
            posts = []
        } else {
            posts=results.posts
        }

        let comments
        if(results.comments===null){
            comments = []
        } else {
            comments=results.comments
        }

        if (req.header('Content-Type') == 'application/json') {
            res.send(posts)
        } else {
            res.render('index',
                {
                    user: req.user,
                    token: token,
                    posts: posts,
                    comments: comments
                }
            )
        }
    })

}

exports.create_post_form = (req, res, next) => {
    const token = utilities.parseJwt(req.cookies.token)
    const user = User.findOne({'username': token.username})

    User.findOne({'username': token.username}, (err,result) => {
        if(result.role === 'admin'){
            res.render('create-post', {token: utilities.getToken(req), user: user})
        } else {
            res.sendStatus(403)
        }
    })
}

exports.create_post = [
    body('title', 'A post title is required').trim().isLength({min: 1}).escape(),
    body('description', 'A post description is required').trim().isLength({min: 1}).escape(),
    body('body', 'A post body is required').trim().isLength({min: 1}).escape(),
    body('image', 'A post body is required').trim().isLength({min: 1}),

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

                    User.findOne({'username': token.username}).exec((err,result) => {
                        const user = result

                        const post = new Post(
                            {
                                author: user._id,
                                title: req.body.title,
                                description: req.body.description,
                                body: req.body.body,
                                image: sanitizeUrl(req.body.image),
                                timestamp: utilities.formatDate(new Date())
                            }
                        )
            
                        if(!errors.isEmpty()){
                            res.render('index', {user: req.user})
                        } else {
                            post.save(err => {
                                    if(err){
                                        return next(err)
                                    } 
                                    
                                    return res.redirect('/')
                            })
                        }
                    })
                }
            }) 
        }
    }
]

exports.read_post = (req, res, next) => {
    let token

    if(req.cookies.token){
        token = utilities.parseJwt(req.cookies.token)
    } else {
        token = ''
    }

    async.parallel({
        post: (cb) => {
            Post.findOne({_id: req.params.postId}).populate('author').exec(cb)
        },
        comments: (cb) => {
            Comment.find({post: req.params.postId}).populate('author').exec(cb)
        }
    }, (err, results) => {
        res.render('post', {post: results.post, comments: results.comments, token: token})
    })
}

exports.update_post_form = (req, res, next) => {
    let token

    if(req.cookies.token){
        token = utilities.parseJwt(req.cookies.token)
    } else {
        token = ''
    }



    async.parallel({
        post: (cb) => {
            Post.findOne({_id: req.params.postId}).exec(cb)
        },
        comments: (cb) => {
            Comment.find({post: req.params.postId}).populate('author').exec(cb)
        }
    }, (err, results) => {
        console.log(results.comments)

        res.render('edit-post', {post: results.post, comments: results.comments, token: token})
    })
}

exports.update_post = [
    body('title', 'A post title is required').trim().isLength({min: 1}).escape(),
    body('description', 'A post description is required').trim().isLength({min: 1}).escape(),
    body('body', 'A post body is required').trim().isLength({min: 1}).escape(),
    body('image', 'A post body is required').trim().isLength({min: 1}),

    (req, res, next) => {
        if (req.header('Content-Type') == 'application/json') {
            return res.send('Received a POST request for update_post')
        } else {
            jwt.verify(req.cookies.token, jwtSecretKey, (err, userData) => {
                if(err){
                    res.sendStatus(403)
                } else {
                    let token

                    if(req.cookies.token){
                        token = utilities.parseJwt(req.cookies.token)
                    } else {
                        token = ''
                    }

                    if(token.role !== 'admin'){
                        return res.redirect('/posts/' + req.params.postId)
                    }

                    const errors = validationResult(req)

                    const post = new Post(
                        {
                            _id: req.params.postId,
                            author: req.body.author,
                            title: req.body.title,
                            description: req.body.description,
                            body: req.body.body,
                            image: sanitizeUrl(req.body.image),
                            timestamp: req.body.timestamp
                        }
                    )
        
                    if(!errors.isEmpty()){

                    
                        async.parallel({
                            post: (cb) => {
                                Post.findOne({_id: req.params.postId}).exec(cb)
                            },
                            comments: (cb) => {
                                Comment.find({post: req.params.postId}).populate('author').exec(cb)
                            }
                        }, (err, results) => {
                            if(err){
                                return next(err)
                            }

                            

                            res.render('edit-post', {post: results.post, comments: results.comments, token: token, errors: errors.array()})
                        })
                    } else {
                        Post.findByIdAndUpdate(req.params.postId, post, (err, thepost) => {
                            if(err){
                                return next(err)
                            }
            
                            return res.redirect('/posts/' + req.params.postId)
                        })
                    }
                }
            }) 
        }
    }
]

exports.delete_post = (req, res, next) => {
    if (req.header('Content-Type') == 'application/json') {
        return res.send('Received a POST request for update_post')
    } else {
        jwt.verify(req.cookies.token, jwtSecretKey, (err, userData) => {
            if(err){
                res.sendStatus(403)
            } else {
                let token

                if(req.cookies.token){
                    token = utilities.parseJwt(req.cookies.token)
                } else {
                    token = ''
                }

                if(token.role !== 'admin'){
                    return res.redirect('/posts/' + req.params.postId)
                }

                const errors = validationResult(req)
    
                if(!errors.isEmpty()){
                    async.parallel({
                        post: (cb) => {
                            Post.findOne({_id: req.params.postId}).exec(cb)
                        },
                        comments: (cb) => {
                            Comment.find({post: req.params.postId}).populate('author').exec(cb)
                        }
                    }, (err, results) => {
                        if(err){
                            return next(err)
                        }

                        res.render('edit-post', {post: results.post, comments: results.comments, token: token, errors: errors.array()})
                    })
                } else {
                    async.parallel({
                        comments: (cb) => {
                            Comment.find({post: req.params.postId}).populate('author').exec(cb)
                        }
                    }, (err, results) => {
                        if(err){
                            return next(err)
                        }
                        
                        results.comments.forEach((comment) => {
                            Comment.findByIdAndDelete(comment._id, (err, thecomment) => {
                                if(err){
                                    return next(err)
                                }

                                return next()
                            })
                        })
                        
                        Post.findByIdAndDelete(req.params.postId, (err, thepost) => {
                            if(err){
                                return next(err)
                            }
            
                            return res.redirect('/')
                        })
                    })
                }
            }
        }) 
    }
}