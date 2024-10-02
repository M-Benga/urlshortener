require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const dns = require('dns');
const bodyParser = require('body-parser')
// Basic Configuration
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});


// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

let shorttenedUrl
let fullUrl
let hostname
let urlDatabase = {};



const getAndValidateUrl = (req) => {
  return new Promise((resolve, reject) => {
    let { url } = req.body;
     
  // Add 'http://' if the user-provided URL does not include a protocol
  if (!/^https?:\/\//i.test(url)) {
    url = 'http://' + url;
  }

    try {
      hostname = new URL(url).hostname;
      // console.log('hostname:', hostname);
    } catch (error) {
      reject('invalid url');
      return;
    }

    dns.lookup(hostname, (err, address, family) => {
      if (err) {
        console.log('Host', hostname);
        reject('invalid URLLL');
      } else {
        console.log('Ip Address:', address);
        console.log('Family:', family);
        console.log('Original url:', url);
        resolve(hostname);
      }
    });
  });
};

app.post('/api/shorturl', (req, res) => {
  getAndValidateUrl(req)
    .then(url => {
      // URL is valid
      shorttenedUrl = Math.floor(Math.random() * (10000 - 1 + 1)) + 1;
      fullUrl = req.body.url;

      // Store the mapping in the urlDatabase
      urlDatabase[shorttenedUrl] = fullUrl;

      res.json({ original_url: req.body.url, short_url: shorttenedUrl });
    })
    .catch(error => {
      // URL is invalid
      res.json({ error: error });
    });
});


app.get('/api/shorturl/:shorttenedUrl', (req, res) => {
  const shortUrlKey = req.params.shorttenedUrl;
  const originalUrl = urlDatabase[shortUrlKey];
   console.log(originalUrl);
  if (originalUrl) {
    console.log('Redirecting to:', originalUrl);
    res.redirect(originalUrl); // Perform the redirect
  } else {
    res.json({ error: 'No short URL found for the given input' });
  }
});



app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
