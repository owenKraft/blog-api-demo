const dotenv = require('dotenv').config()
const express = require('express')
const path = require('path')
const session = require('express-session')
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const compression = require('compression')
const helmet = require('helmet')
const cookieParser = require('cookie-parser');

mongoose.connect(process.env.DB_HOST, { useUnifiedTopology: true, useNewUrlParser: true })
const db = mongoose.connection
db.on('error', console.error.bind(console, 'mongo connection error'))

const app = express()
app.set('views',path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.use(helmet({
    contentSecurityPolicy: false,
}))
app.use(compression())
app.use(cookieParser());
app.use(session({secret: 'cats', resave: false, saveUninitialized: true}))
app.use(passport.initialize())
app.use(passport.session())
app.use(express.urlencoded({extended: false}))
app.use(express.static('public'))
app.use(express.static(path.join(__dirname, 'public')))

const indexRouter = require('./routes/indexRouter')

app.use('/', indexRouter)

app.listen(3000, () => console.log('app listening on port 3000'))

module.exports = app