const express = require('express')
const router = express.Router()
const passport = require('passport')
const atob = require('atob')

require('../utilities/passport')

const Post = require('../models/post')
const User = require('../models/user')
const Comment = require('../models/comment')

const utilities = require('../utilities/utilities')

const postController = require('../controllers/postController')
const userController = require('../controllers/userController')
const commentController = require('../controllers/commentController')

// GET home page
router.get('/', postController.retrieve_posts)

// GET individual post
router.get('/posts/:postId', postController.read_post)

// GET form to create posts
router.get('/posts', postController.create_post_form)

// POST individual post
// router.post('/posts', passport.authenticate('jwt', {session: false}), postController.create_post)
router.post('/posts', postController.create_post)
// router.post('/posts', verifyToken, postController.create_post)

// GET form to create posts
router.get('/posts/:postId/update', postController.update_post_form)

// PUT individual post
router.post('/posts/:postId', postController.update_post)

// DELETE individual post
router.post('/posts/:postId/delete', postController.delete_post)

// GET register page
router.get('/register', userController.register)

// GET login page
router.get('/login', userController.login_get)

// POST login page
router.post('/login', userController.login_post)

// get logout page
router.get('/logout', userController.logout)

// GET all users
router.get('/users', userController.retrieve_users)

// GET individual user
router.get('/users/:userId', userController.read_user)

// POST individual user
router.post('/register', userController.create_user)

// PUT individual user
router.put('/users/:userId', userController.update_user)

// DELETE individual user
router.delete('/users/:userId', userController.delete_user)

// GET all comments
router.get('/comments', commentController.retrieve_comments)

// GET individual comment
router.get('/comments/:commentId', commentController.read_comment)

// POST individual comment
router.post('/comments', commentController.create_comment)

// PUT individual comment
router.put('/comments/:commentId', commentController.update_comment)

// DELETE individual comment
router.delete('/comments/:commentId', commentController.delete_comment)

module.exports = router