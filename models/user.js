const mongoose = require('mongoose')

const Schema = mongoose.Schema

const User = new Schema (
    {
        username: { type: String, required: true },
        password: { type: String, required: true },
        role: { type: String, required: true },
        publicName: {type: String, required: false}
    }
)

module.exports = mongoose.model('User', User)