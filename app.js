var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const campsiteRouter = require('./routes/campsiteRouter');
const partnerRouter = require('./routes/partnerRouter');
const promotionRouter = require('./routes/promotionRouter');

const mongoose = require('mongoose');

const url = 'mongodb://localhost:27017/nucampsite';
const connect = mongoose.connect(url, {
    useCreateIndex: true,
    useFindAndModify: false,
    useNewUrlParser: true, 
    useUnifiedTopology: true
});

connect.then(() => console.log('Connected correctly to server'), 
    err => console.log(err)
);

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// The middleware functions are applied in the order they appear 
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser('12345-67890-09876-54321')); // signed cookie

// Defining authentication middleware
function auth(req, res, next){ 
    if (!req.signedCookies.user) {// if the request doesn't have a signed cookie
        const authHeader = req.headers.authorization;   
        if (!authHeader) { // If null, it means there's no authentication information in this request
            const err = new Error('You\'re not authenticated');
            res.setHeader('WWW-Authenticate', 'Basic'); // Server is requesting authentication to the client through a basic method
            err.status = 401; // Unauthorized
            return next(err);
        }

        // Takes the authorization header, extracts the username and password and put them in the auth array
        const auth = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
        const user = auth[0];
        const pass = auth[1];
        if (user === 'admin' && pass === 'password') {
            /**
             * Setting up a cookie. 1st argument name property, followed by the value, 
             * 3rd argument is optional to create a signed cookie
             */
            res.cookie('user', 'admin', {signed: true}); 
            return next(); // access granted/authorized
        } else {
            const err = new Error('You\'re not authenticated!');
            res.setHeader('WWW-Authenticate', 'Basic');
            err.status = 401; // Unauthorized
            return next(err);
        }
    } else { // if there is a signed cookie in the request
        if (req.signedCookies.user === 'admin') {
            return next();
        } else {
            const err = new Error('You\'re not authenticated!');
            err.status = 401; // Unauthorized
            return next(err);
        }
    }
}

app.use(auth); // using authentication middleware

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/campsites', campsiteRouter);
app.use('/partners', partnerRouter);
app.use('/promotions', promotionRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
