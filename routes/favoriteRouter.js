const express = require('express');
const bodyParser = require('body-parser'); // Do I need bodyparser? Doesn't mention it on the instructions 
const Favorite = require('../models/favorite');
const Campsite = require('../models/campsite');
const authenticate = require('../authenticate');
const cors = require('./cors');

const favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
.options(cors.corsWithOptions, (req,res) => res.sendStatus(200))
.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({user: req.user._id}) // retrieve the list of favorites for the user
    .populate('user')
    .populate('campsites')
    .then(favorites => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorites);
    })
    .catch(err => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({user: req.user._id})  // check if the user has an associated favorite document 
    .populate('user')
    .then(favorites => { 
        if (favorites) { //check if not null
        // check which campsites in the request body is already in the campsites array of the favorite document
        req.body.forEach(element => {
            if (!favorites.campsites.includes(element._id)) { // check if the id is NOT in the campsites array already
                favorites.campsites.push(element._id); // if so, adds it to the favorite list                  
            } else {
                console.log("Campsite already listed as favorite", element._id);
            }
        });
        favorites.save() // saves the updates
        .then(favorites => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(favorites);
        })
        .catch(err => next(err));
        } else { // user does't have a favorite document.
            Favorite.create({"user": req.user._id, "campsites": req.body}) // creates a favorite document
            .then(favorites => {
                console.log('Favorite document created ', favorites);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorites);
            })
            .catch(err => next(err));
        }
    }).catch(err => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403; // Forbidden
    res.end('PUT operation not supported on /favorites');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOneAndDelete({user: req.user._id})
    .then(response => {
        res.statusCode = 200; // Success
        res.setHeader('Content-type', 'application/json');
        res.json(response);
    })
    .catch(err => next(err));
});

favoriteRouter.route('/:campsiteId')
.options(cors.corsWithOptions, (req,res) => res.sendStatus(200))
.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403; // Forbidden
    res.end(`GET operation not supported on /favorites/${req.params.campsiteId}`);
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({user: req.user._id})  // check if the user has an associated favorite document 
    .populate('user')
    .then(favorites => { 
        if (favorites) { //check if not null
            if (!favorites.campsites.includes(req.params.campsiteId)) { // check if the id is NOT in the campsites array already
                favorites.campsites.push(req.params.campsiteId); // if so, adds it to the favorite list                  
            } else {
                err = new Error("That campsite is already in the list of favorites!");
                err.status = 409; // Conflict
                return next(err); 
            }
            favorites.save() // saves the updates
            .then(favorites => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorites);
            })
            .catch(err => next(err));
        } else { // user does't have a favorite document.
            Favorite.create({"user": req.user._id, "campsites": req.params.campsiteId}) // creates a favorite document
            .then(favorites => {
                console.log('Favorite document created ', favorites);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorites);
            })
            .catch(err => next(err));
        }
    }).catch(err => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403; // Forbidden
    res.end(`PUT operation not supported on /favorites/${req.params.campsiteId}`);
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({user: req.user._id})  // check if the user has an associated favorite document 
    .then(favorites => {
        if (favorites) { // check if not null
            favorites.campsites.splice(favorites.campsites.indexOf(req.params.campsiteId), 1);
            favorites.save()
            .then(response => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(response);
            })
            .catch(err => next(err));
        } else {
            err = new Error('Favorite list is already empty');
            err.status = 404; // Not Found
            return next(err);
        }
    })
    .catch(err => next(err));
});


module.exports = favoriteRouter;