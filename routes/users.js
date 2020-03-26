const express = require('express');
const User = require('../models/user');

const router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
    res.send('respond with a resource');
});

router.post('/signup', (req, res, next) =>{
    User.findOne({username: req.body.username})
    .then(user => {
        if (user) { // user document was found with a matching name
            const err = new Error(`User ${req.body.username} already exists!`);
            err.status = 403; // forbidden 
            return next(err);
        } else { // ok to create a new user with this name 
            User.create({
                username: req.body.username,
                password: req.body.password
            })
            .then(user => {
                res.statusCode = 200; // success
                res.setHeader('Content-Type', 'application/json');
                res.json({ status: 'Registration Successful!', user: user});
            })
            .catch(err => next(err));
        }
    })
    .catch(err => next(err));
});

router.post('/login', (req, res, next) => {
    if (!req.session.user) {
        const authHeader = req.headers.authorization;   
        if (!authHeader) { // If null, it means there's no authentication information in this request
            const err = new Error('You\'re not authenticated');
            res.setHeader('WWW-Authenticate', 'Basic'); // Server is requesting authentication to the client through a basic method
            err.status = 401; // Unauthorized
            return next(err);
        }

        // Takes the authorization header, extracts the username and password and put them in the auth array
        const auth = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
        const username = auth[0];
        const password = auth[1];

        User.findOne({username: username})
        .then(user => {
            if (!user) {
                const err = new Error(`User ${username} does not exist!`);
                err.status = 401; // Unauthorized
                return next(err);
            } else if (user.password !== password){
                const err = new Error('Your password is incorrect!');
                err.status = 401; // Unauthorized
                return next(err);
            } else if (user.username === username && user.password === password) {
                req.session.user = 'authenticated';
                res.statusCode = 200; // Success
                res.setHeader('Content-Type', 'text/plain');
                res.end('You are authenticated!');
            }
        })
        .catch(err => next(err));
    } else {
        res.statusCode = 200; // Success
        res.setHeader('Content-Type', 'text/plain');
        res.end('You are already authenticated!');
    }
});

router.get('/logout', (req, res, next) => {
    if (req.session) { // checks if session exists
        req.session.destroy(); // deletes session file
        res.clearCookie('session-id'); // clears the cookie
        res.redirect('/'); // redirects to the '/' path
    } else {
        const err = new Error('You are not logged in!');
        err.status = 401; // Unauthorized
        return next(err);
    }
})

module.exports = router;
