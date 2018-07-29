var express = require('express');
var request = require('request-promise'); // "Request" library
var router = express.Router();
var querystring = require('querystring');
var cookieParser = require('cookie-parser');
var PropertiesReader = require('properties-reader');
var properties = PropertiesReader('client.properties');


// i'm thinking all of the wikipedia queries will go in the 
// '/' router get, and then the data can be passed along and rendered
// in the login pug page

// will most likely be using the get /page/html/{title} api endpoint to 
// retreive the data from wikipedia and then have to check to make sure 
// it's the song/album/artist we are looking for and then parse
// to determine what information to display

// function to convert the song title, artist, etc strings
// obtained from spotify into the correct format for 
// requesting through wikipedia rest api
function stringToWikiFormat(s) {
  // probably has some edge cases that'll need to be thought of
  s = s.charAt(0).toUpperCase() + s.substr(1); 

  for(var i = 1; i < s.length; i++){
    if(s.charAt(i) == ' ') {
      s = s.substr(0,i) + '_' + s.charAt(i+1).toUpperCase() + s.substr(i+2);
    }
  }
  return s;
}

router.get('/', function (req, res, next) {
    res.render('login', { 
      name: req.query.user_name, 
      song_title: req.query.song_name, 
      artist: req.query.artist,
      album: req.query.album
    });  
  });

module.exports = router;