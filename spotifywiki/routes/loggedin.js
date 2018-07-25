var express = require('express');
var request = require('request-promise'); // "Request" library
var router = express.Router();
var querystring = require('querystring');
var cookieParser = require('cookie-parser');
var PropertiesReader = require('properties-reader');
var properties = PropertiesReader('client.properties');

router.get('/', function (req, res, next) {
    res.render('login', { 
      name: req.query.user_name, 
      song_title: req.query.song_name, 
      artist: req.query.artist,
      album: req.query.album
    });
      
  });

module.exports = router;