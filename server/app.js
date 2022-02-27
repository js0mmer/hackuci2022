// const dotenv = require("dotenv");
// var SpotifyWebApi = require('spotify-web-api-node');

// dotenv.config({ path: ".env" });

// var spotifyApi = new SpotifyWebApi({
//   clientId: process.env.CLIENT_ID,
//   clientSecret: process.env.CLIENT_SECRET,
//   redirectUri: process.env.REDIRECT_URI
// });

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


const express = require('express')
const app = express()

function getVibrance(color) {
  return Math.max(color[0] / 255, color[1] / 255, color[2] / 255);
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
  return (color[0] - color[1]) / 255;
}

function getValences(warmth) {
  return { min: Math.max(0, warmth - 0.2), max: Math.min(1, warmth + 0.2)}
}

function analyzeMood(colors) {
  warmths = [];
  for(const color of colors) {
    warmth = getWarmth(color);
    vibrance = getVibrance(color);
    if (vibrance > 10) { // ignore dark/black colors (< 10% vibrance)
      warmths.push(warmth);
    }
  }

  avg_warmth = sum(warmths) / warmths.length;

  return getValences(warmth)
}

function sum(array) {
  total = 0;

  for(let val in array) {
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

app.use('/images', express.static('uploads'))

// app.listen(port, () => {
//   console.log(`Listening on port ${port}`)
// });

module.exports = app;