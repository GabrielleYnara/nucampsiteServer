const express = require('express');
const User = require('../models/user');
const passport = require('passport');

const router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
    res.send('respond with a resource');
});

router.post('/signup', (req, res) =>{
    // static method on the uder module
    User.register(
        new User ({username: req.body.username}),
        req.body.password,
        err => {
            if (err) {
                res.statusCode = 500; // Internal server error
                res.setHeader('Content-Type', 'application/json');
                res.json({err: err});
            } else {
                passport.authenticate('local')(req, res, () => {
                    res.statusCode = 200; // Success
                    res.setHeader('Content-Type', 'application/json');
                    res.json({success: true, status: 'Registration Successful!'});
                })
            }
        }
    )
});

router.post('/login', passport.authenticate('local'), (req, res) => {// passport deals with the loggin
    res.statusCode = 200; // Success
    res.setHeader('Content-Type', 'application/json');
    res.json({success: true, status: 'You are successfully logged in!'});
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
