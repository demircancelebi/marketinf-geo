var express = require('express');
var jsonfile = require('jsonfile');
var fs = require('fs');
var router = express.Router();

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

/* GET home page. */

router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});


// get all available country codes
router.get('/countries', function (req, res) {
  var toSend = [];
  fs.readdir('./data', function (err, list) {
    if (err) {
      res.send(400);
      return;
    }

    if (!list || !list.length) {
      res.send(404);
      return;
    }

    list.forEach(function (c) {
      var cc = c.split('.');
      if (cc[1] === 'json') {
        toSend.push(cc[0]);
      }
    });

    res.send(200, toSend.sort());
  });
});

router.get('/countries/:code', function (req, res) {
  var code = req.params.code.toUpperCase();
  jsonfile.readFile('./data/' + code + '.json', function (err, content) {
    if (err || !content) {
      res.send(404);
      return;
    }

    res.send(200, content);
  });
});

router.get('/countries/:code/:area', function (req, res) {
  var code = req.params.code.toUpperCase();
  var area = req.params.area.toLowerCase();
  area = capitalizeFirstLetter(area);

  jsonfile.readFile('./data/' + code + '.json', function (err, content) {
    if (err || !content) {
      res.send(404);
      return;
    }

    if (!content.administrative_area_level_1s.hasOwnProperty(area)) {
      res.send(404);
      return;
    }

    res.send(200, content.administrative_area_level_1s[area]);
  });
});

module.exports = router;
