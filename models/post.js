const mongoose = require('mongoose')

const Schema = mongoose.Schema

const Post = new Schema(
    {
        author: {type: Schema.Types.ObjectId, ref: 'User', required: true},
        title: {type: String, required: true},
        body: {type: String, required: true},
        description: {type: String, required: false},
        image: {type: String, required: false},
        timestamp: {type: String, required: false},
        comments: [{type: Schema.Types.ObjectId, ref: 'Comment'}]
    }
)

module.exports = mongoose.model('Post', Post)