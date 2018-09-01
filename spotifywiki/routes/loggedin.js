var express = require('express');
var request = require('request-promise'); // "Request" library
var router = express.Router();
var querystring = require('querystring');
var cookieParser = require('cookie-parser');
var PropertiesReader = require('properties-reader');
var properties = PropertiesReader('client.properties');
var wikipedia = require('node-wikipedia');
var fastHTML = require('fast-html-parser');


// i'm thinking all of the wikipedia queries will go in the 
// '/' router get, and then the data can be passed along and rendered
// in the login pug page


// function to convert the song title, artist, etc strings
// obtained from spotify into the correct format 
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

  // var wikirequest = {
  //   url: 'https://en.wikipedia.org/api/rest_v1/page/html/' + stringToWikiFormat(req.query.song_name),
  //   json: true
  // };
  // request.get(wikirequest).then(function(wikibody){
  //   var root = fastHTML.parse(wikibody);
  //   console.log(root.querySelector('#1'));
  // })

  wikipedia.page.data("Diane_Young", { content: true }, function(response) {
    // structured information on the page for Diane Young (wikilinks, references, categories, etc.)
    // var root = fastHtml.parse(response.text);
    // console.log(root.querySelector('#Personnel'));
    console.log(response);
  });

    res.render('login', { 
      name: stringToWikiFormat(req.query.user_name), 
      song_title: stringToWikiFormat(req.query.song_name), 
      artist: stringToWikiFormat(req.query.artist),
      album: stringToWikiFormat(req.query.album)
    });  
  });

module.exports = router;