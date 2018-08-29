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
  // works correctly, might still have some edge cases i haven't thought of
  s = s.charAt(0).toUpperCase() + s.substr(1); 

  for(var i = 1; i < s.length; i++){
    if(s.charAt(i) == ' ') {
      s = s.substr(0,i) + '_' + s.charAt(i+1).toUpperCase() + s.substr(i+2);
    }
  }
  return s;
}



router.get('/', function (req, res, next) {

  var wikirequest = {
    url: 'https://en.wikipedia.org/api/rest_v1/page/html/' + stringToWikiFormat(req.query.song_name),
    json: true
  };
  request.get(wikirequest).then(function(wikibody){
    console.log(wikibody);
  })

    res.render('login', { 
      name: stringToWikiFormat(req.query.user_name), 
      song_title: stringToWikiFormat(req.query.song_name), 
      artist: stringToWikiFormat(req.query.artist),
      album: wikirequest
      // album: stringToWikiFormat(req.query.album)
    });  
  });

module.exports = router;