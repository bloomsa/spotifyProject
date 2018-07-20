var express = require('express');
var request = require('request'); // "Request" library
var router = express.Router();
var querystring = require('querystring');
var cookieParser = require('cookie-parser');
var PropertiesReader = require('properties-reader');
var properties = PropertiesReader('client.properties');

//  most of this was copied from the example, not working yet. gonna be messing 
//  around with it

// update: not crashing, gonna try redirecting to display user's data

var client_id = properties.get('client.id'); // Your client id
var client_secret = properties.get('client.secret'); // Your secret
var redirect_uri = 'http://localhost:3000/callback'; // Your redirect uri

console.log(client_id);

//  generate random string function used from publically available
//  source code of spotify web-api-auth-examples in the authorization
//  code's app.js file 
/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
var generateRandomString = function (length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

var stateKey = 'spotify_auth_state';

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'spotify-wiki web app' });
});

router.get('/login', function (req, res, next) {
  // i think generating a cookie to be stored with the site for future log ins
  var state = generateRandomString(16);
  res.cookie(stateKey, state);

  var scope = 'user-read-private user-read-email user-read-currently-playing user-read-playback-state';
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state
    }));
  // this causes an error for some reason
  // res.render('login');
});


//  localhost:3000/callback is the redirect uri approved 
//  for my app permissions on spotify, so it will
//  redirect here after successful (or failed) auth

router.get('/callback', function (req, res) {

  // your application requests refresh and access tokens
  // after checking the state parameter

  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState) {
    res.redirect('/#' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
  } else {
    res.clearCookie(stateKey);
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
      },
      json: true
    };

    request.post(authOptions, function (error, response, body) {
      if (!error && response.statusCode === 200) {

        var access_token = body.access_token,
          refresh_token = body.refresh_token;
        // sam: modified the url to go to the currently playing endpoint
        // now it fetches this:
        // https://developer.spotify.com/documentation/web-api/reference/player/get-the-users-currently-playing-track/

        var optionsCurrentlyPlaying = {
          url: 'https://api.spotify.com/v1/me/player/currently-playing',
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        };

        //https://api.spotify.com/v1/me
        var optionsUser = {
          url: 'https://api.spotify.com/v1/me',
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        };

        // use the access token to access the Spotify Web API
        request.get(optionsUser, function (error, response, body) {
          request.get(optionsCurrentlyPlaying, function (er, resp, bod) {
            if (bod && body) {
              res.render('login', { title: 'spotipedia (name in progress)', user: body, display: bod });//body will be used in login.pug
            }else{
              //Redirect to Error
            }
          })
        });

        // we can also pass the token to the browser to make requests from there
        /*
        We can't have redirects here
        res.redirect('/#' +
          querystring.stringify({
            access_token: access_token,
            refresh_token: refresh_token
          }));
          */
      } else {
        /*
        res.redirect('/#' +
          querystring.stringify({
            error: 'invalid_token'
          }));
          */
      }
    });
  }
});

router.get('/refresh_token', function (req, res) {

  // requesting access token from refresh token
  var refresh_token = req.query.refresh_token;
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    },
    json: true
  };

  request.post(authOptions, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      var access_token = body.access_token;
      res.send({
        'access_token': access_token
      });
    }
  });
});


module.exports = router;
