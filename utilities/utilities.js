const express = require('express')
const router = express.Router()
const passport = require('passport')
const atob = require('atob')

function parseJwt (token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}

function formatDate (timestamp) {

    // Create a date object from the timestamp
    let date = new Date(timestamp);

    // Create a list of names for the months
    let months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October',	'November', 'December'];

    // return a formatted date
    return months[date.getMonth()] + ' ' + date.getDate() + ', ' + date.getFullYear();

}

function getToken (req) {
    let token

    if(req.cookies.token){
        token = parseJwt(req.cookies.token)
    } else {
        token = ''
    }

    return token
}

module.exports = { 
    parseJwt, 
    formatDate,
    getToken 
}