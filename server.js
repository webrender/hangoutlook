// server.js
// where your node app starts

// init project
var rp = require('request-promise');
var Bluebird = require('bluebird');
var express = require('express');
var bodyParser = require('body-parser');
var parser = require('vdata-parser');
var path = require('path');
var app = express();
app.use(express.static(path.join(__dirname, 'public')));

app.get("/", function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

app.get('/data', function(req, res) {
    var url = decodeURIComponent(req.query.c);
    rp(url)
    .then(calRes => {
        var eventArray = parser.fromString(calRes).VCALENDAR.VEVENT;
        res.json({
          domain: process.env.GOOGLE_DOMAIN,
          patterns: process.env.CALL_URL_PATTERNS.split(','),
          events: eventArray
        });
    });
});

app.get('/bg', function(req, res) {
  rp(`https://api.unsplash.com/photos/random?client_id=${process.env.UNSPLASH_CLIENT_ID}&query=landscape&orientation=landscape&count=1`)
  .then(bgRes => {
    res.json(JSON.parse(bgRes));
  });
});

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
    console.log('Your app is listening on port ' + listener.address().port);
});
