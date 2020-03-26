var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const session = require('express-session');
const FileStore = require('session-file-store')(session); // 

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
//app.use(cookieParser('12345-67890-09876-54321')); // signed cookie

app.use(session({
    name: 'session-id',
    secret: '12345-67890-09876-54321',
    saveUninitialized: false, // when new session is created but there's no updates, it won get saved at the end of the session  
    resave: false, // once a session has been created and updated in sync, it will continue to be saved
    store: new FileStore() 
}))

app.use('/', indexRouter);
app.use('/users', usersRouter);

// Defining authentication middleware
function auth(req, res, next){ 
    console.log(req.session);

    if (!req.session.user) {// if the request doesn't have a signed cookie
            const err = new Error('You\'re not authenticated');
            err.status = 401; // Unauthorized
            return next(err);
    } else { // if there is a signed cookie in the request
        if (req.session.user === 'authenticated') {
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
