const dotenv = require("dotenv");
const SpotifyWebApi = require('spotify-web-api-node');
const path = require('path')
const getColors = require('get-image-colors')
const multer = require('multer')
const crypto = require('crypto');
const sharp = require('sharp');
const express = require('express');

const app = express()
const scopes = ['user-read-private', 'user-read-email', 'playlist-modify-public', 'playlist-modify-private', 'user-top-read', 'ugc-image-upload'];
var sessions = new Map();
var sessionTimestamp = new Map();

dotenv.config({ path: ".env" });

var generate_key = function() {
    // 16 bytes is likely to be more than enough,
    // but you may tweak it to your needs
    return crypto.randomBytes(16).toString('base64');
};

function rgbToHSV(r, g, b) {
  r /= 255, g /= 255, b /= 255;

  var max = Math.max(r, g, b), min = Math.min(r, g, b);
  var h, s, v = max;

  var d = max - min;
  s = max == 0 ? 0 : d / max;

  if (max == min) {
    h = 0; // achromatic
  } else {
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }

    h /= 6;
  }

  return [ h, s, v ];
}

function hexToRGB(color) {
    r = parseInt(color.substring(1, 3), 16);
    g = parseInt(color.substring(3, 5), 16);
    b = parseInt(color.substring(5, 7), 16);
    return [r, g, b]
}

const imageFilter = function(req, file, cb) {
  // Accept images only
  if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF)$/)) {
      req.fileValidationError = 'Only image files are allowed!';
      return cb(new Error('Only image files are allowed!'), false);
  }
  cb(null, true);
};

function getValences(val) {
  return { min: Math.max(0, val - 0.2), max: Math.min(1, val + 0.2)}
}

function analyzeMood(colors) {
  warms = 0;
  colds = 0;
  sats = 0;
  grays = 0;

  for (const color of colors) {
    rgb = hexToRGB(color);
    hsv = rgbToHSV(rgb[0], rgb[1], rgb[2])
    vibrance = hsv[2]

    if (vibrance > .1) { // ignore dark/black colors (< 10% vibrance)
      if (rgb[0] - 10 > rgb[2]) {
        warms++;
      } else if (rgb[2] - 10 > rgb[0]) {
        colds++;
      }
    }

    if (hsv[1] > 0.6) {
      sats++;
    } else if (hsv[1] < 0.4) {
      grays++;
    }
  }

  avg_warmth = (warms - colds) / (warms + colds) / 2 + .5;
  saturation = (sats - grays) / (sats + grays) / 2 + .5;

  return getValences(.7 * avg_warmth + .3 * saturation)
}

async function makePlaylist(spotifyApi, valences, image, imageName, res) {
  let playlistId;

  let name = imageName.split('.');
  name.pop();

  await spotifyApi.createPlaylist(name.join(''), { 'description': 'Created by PlayPic' , 'public': false })
    .then(data => {
      playlistId = data.body.id;
      // console.log(playlistId);
    }, err => {
      console.log('Failed to create playlist', err);
      res.send(null);
      return;
    });
  
  await spotifyApi.uploadCustomPlaylistCoverImage(playlistId, image.toString('base64'))
    .then(() => {}, err => {
      console.log('Failed to add custom playlist cover image', err);
    });

  let topArtistIds;
  let recommendations;

  await spotifyApi.getMyTopArtists()
    .then(data => {
      let topArtists = data.body.items;
      topArtistIds = topArtists.map(artist => artist.id).slice(0, 5); // return array of artist ids, can be no more than 5 because spotify api limits it
      console.log(topArtistIds);
    }, err => {
      console.log('Failed to get top artists', err);
      res.send(null);
      return;
    });

  await spotifyApi.getRecommendations({
      seed_artists: topArtistIds,
      min_valence: valences['min'],
      max_valence: valences['max']
    })
    .then(data => {
      let tracks = data.body.tracks;
      recommendations = tracks.map(track => track.uri);
      console.log(recommendations);
    }, err => {
        console.log('Failed to get recommendations', err);
        res.send(null);
        return;
    });

  await spotifyApi.addTracksToPlaylist(playlistId, recommendations)
    .then(() => { 
      res.send({ id: playlistId });
    }, err => {
      console.log('Failed to add tracks to playlist', err);
      res.send(null);
      return;
    });
}

const THIRTY_MIN = 1000 * 60 * 30;

function purgeSessions() {
  let sessionsToRemove = [];

  for (let [state, time] of sessionTimestamp) {
    if (Date.now() - time > THIRTY_MIN) {
      sessions.delete(state);
      sessionsToRemove.push(state); // probably bad idea to modify map while iterating over it
    }
  }

  for (const state of sessionsToRemove) {
    sessionTimestamp.delete(state);
  }
}

// for debugging
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.post('/upload', (req, res) => {
  console.log('got upload');

  // 'image' is the name of our file input field in the HTML form
  let upload = multer({ /* storage: storage, */ fileFilter: imageFilter }).single('image');

  upload(req, res, err => {
    // req.file contains information of uploaded file
    // req.body contains information of text fields, if there were any

    if (req.fileValidationError) {
        return res.send(req.fileValidationError);
    } else if (!req.file) {
        return res.send('Please select an image to upload');
    } else if (err instanceof multer.MulterError) {
        return res.send(err);
    } else if (err) {
        return res.send(err);
    }

    let image = (await sharp(Buffer.from(req.file.buffer)).resize(800).toBuffer());
  
    getColors(image, req.file.mimetype)
      .then(async colors => {
        // `colors` is an array of color objects
        c = colors.map(color => color.hex())
        console.log(c)

        let valences = analyzeMood(c);

        const state = decodeURIComponent(req.body.state);
        const spotifyApi = sessions.get(state);
        sessions.delete(state);

        makePlaylist(spotifyApi, valences, image, req.file.originalname, res);
      });
  });
});

app.get('/login', (req, res) => {
  const state = generate_key();
  
  const spotifyApi = new SpotifyWebApi({
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    redirectUri: process.env.REDIRECT_URI
  });

  purgeSessions();
  sessions.set(state, spotifyApi);
  sessionTimestamp.set(state, Date.now());

  let url = spotifyApi.createAuthorizeURL(scopes, state)
  
  // application requests authorization
  res.redirect(url);
});

const BASE_URL = process.env.NODE_ENV == 'PRODUCTION' ? '' : 'http://localhost:3000';

app.get('/callback', async (req, res) => {
  console.log(req.query);
  const { code, state } = req.query;

  const spotifyApi = sessions.get(state);

  try {
    let data = await spotifyApi.authorizationCodeGrant(code)
    const { access_token, refresh_token } = data.body;
    spotifyApi.setAccessToken(access_token);
    spotifyApi.setRefreshToken(refresh_token);

    res.redirect(BASE_URL + '/upload?state=' + encodeURIComponent(state));
  } catch(err) {
    res.redirect(BASE_URL + '/?error=true');
    console.log(err);
  }
})

// app.use('/images', express.static('uploads'))
app.use(express.static(path.join(__dirname, '../client/build/')));

// All other GET requests not handled before will return our React app
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
});

module.exports = app;