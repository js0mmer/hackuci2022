const dotenv = require("dotenv");
var SpotifyWebApi = require('spotify-web-api-node');

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
const buffer = fs.readFileSync(path.join(__dirname, 'IMG_1450.JPG'))
const getColors = require('get-image-colors')


const express = require('express')
const app = express()
const port = 3000

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

app.get('/', (req, res) => {
    
getColors(buffer, 'image/jpg').then(colors => {
    // `colors` is an array of color objects
    c = colors.map(color => color.hex())
    console.log(c)
    rgb = hexToRGB(c[0])
    res.send(c + 'rgb: ' + rgb + ' hsv: ' + rgbToHSV(rgb[0], rgb[1], rgb[2]))
  })
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})