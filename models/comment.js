const mongoose = require('mongoose')

const Schema = mongoose.Schema

const Comment = new Schema (
    {
        author: {type: Schema.Types.ObjectId, ref: 'User', required: true},
        post: {type: Schema.Types.ObjectId, ref: 'Post', required: true},
        text: { type: String, required: true },
        timestamp: {type: String, required: false}
    }
)

module.exports = mongoose.model('Comment', Comment)