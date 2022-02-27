const dotenv = require("dotenv");
var SpotifyWebApi = require('spotify-web-api-node');

dotenv.config({ path: ".env" });

var spotifyApi = new SpotifyWebApi({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  redirectUri: process.env.REDIRECT_URI
});

// spotifyApi.getRecommendations({
//     min_valence: 0.8,
//     max_valence: 1,
//     // seed_artists: top_artists,
//   })
//   .then(function(data) {
//     let tracks = data.body.tracks;
//     recommendations = tracks.map(track => track.uri);
//     console.log(recommendations);
//     // res.status(200).json({
//     //   tracks: recommendations
//     // })
//   }, function(err) {
//       console.log("Something went wrong!", err);
//   });
const path = require('path')
const fs = require('fs')
const buffer = fs.readFileSync(path.join(__dirname, '../test/IMG_1450.JPG'))
const getColors = require('get-image-colors')
const multer = require('multer')
var scopes = ['user-read-private', 'user-read-email', 'playlist-modify-public', 'playlist-modify-private', 'user-top-read'];

const express = require('express')
const app = express()

function getVibrance(color) {
  return Math.max(color[0] / 255, color[1] / 255, color[2] / 255);
}

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


app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
      cb(null, 'uploads/');
  },

  // By default, multer removes file extensions so let's add them back
  filename: function(req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

app.get('/', (req, res) => {
    
  getColors(buffer, 'image/jpg').then(colors => {
    // `colors` is an array of color objects
    c = colors.map(color => color.hex())
    console.log(c)
    rgb = hexToRGB(c[0])
    res.send(c + 'rgb: ' + rgb + ' hsv: ' + rgbToHSV(rgb[0], rgb[1], rgb[2]))
  });
});

const imageFilter = function(req, file, cb) {
  // Accept images only
  if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF)$/)) {
      req.fileValidationError = 'Only image files are allowed!';
      return cb(new Error('Only image files are allowed!'), false);
  }
  cb(null, true);
};

// 0 is cold 1 is warm 0.5 is neutral
function getWarmth(color) {
  return ((color[0] / 255 - color[2] / 255) + 1) / 2;
}

function getValences(val) {
  return { min: Math.max(0, val - 0.2), max: Math.min(1, val + 0.2)}
}

function analyzeMood(colors) {
  warmths = [];
  warms = 0;
  colds = 0;
  sats = 0;
  grays = 0;
  for(const color of colors) {
    rgb = hexToRGB(color);
    hsv = rgbToHSV(rgb[0], rgb[1], rgb[2])
    // warmth = getWarmth(rgb);
    vibrance = hsv[2]
    // console.log(vibrance)
    if (vibrance > .1) { // ignore dark/black colors (< 10% vibrance)
      // warmths.push(warmth);
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

  // avg_warmth = 0

  // if(warmths.length > 0) {
  //   avg_warmth = sum(warmths) / warmths.length;
  // }

  avg_warmth = (warms - colds) / (warms + colds) / 2 + .5;
  saturation = (sats - grays) / (sats + grays) / 2 + .5;

  return getValences(.7 * avg_warmth + .3 * saturation)
}

function sum(array) {
  total = 0;

  for(const val of array) {
    total += val;
  }

  return total;
}

app.post('/upload', (req, res) => {
  console.log('got upload');

  // 'image' is the name of our file input field in the HTML form
  let upload = multer({ storage: storage, fileFilter: imageFilter }).single('image');

  upload(req, res, function(err) {
      // req.file contains information of uploaded file
      // req.body contains information of text fields, if there were any

      if (req.fileValidationError) {
          return res.send(req.fileValidationError);
      }
      else if (!req.file) {
          return res.send('Please select an image to upload');
      }
      else if (err instanceof multer.MulterError) {
          return res.send(err);
      }
      else if (err) {
          return res.send(err);
      }
    
      getColors(fs.readFileSync(req.file.path), req.file.mimetype).then(colors => {
        // `colors` is an array of color objects
        c = colors.map(color => color.hex())
        console.log(c)

        valences = analyzeMood(c);

        response = {
          valences: valences,
          path: req.file.path
        }

        res.send(response)
      });
  });
});

var generateRandomString = function(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};


app.get('/login', (req, res) => {
  var state = generateRandomString(16);
  var url = spotifyApi.createAuthorizeURL(scopes, state)
  // res.cookie(stateKey, state);
  // var scope = scopes.join(",");

  console.log(url);
  
  // application requests authorization
  res.redirect(url);
});

app.get('/callback', (req, res) => {
  console.log(req.body);
})



app.use('/images', express.static('uploads'))

// app.listen(port, () => {
//   console.log(`Listening on port ${port}`)
// });

module.exports = app;