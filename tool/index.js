'use strict';

var op = require('query-overpass');
var asc = require('async');
var jsonfile = require('jsonfile');
var _ = require('lodash');
var inputs = process.argv.slice(2);
var country = inputs[0];
var short = inputs[1];
var a1 = inputs[2];
var a2 = inputs[3]

var q1 = '[out:json];(node[name="' + country +  '"];);out;';
var q2 = '[out:json];area[name="' + country + '"];(node[place="' + a1 + '"](area););out;';

var generateCityQuery = function (city) {
  return '[out:json];area[name="' + city + '"];(node[place="' + a2 + '"](area););out;';
}

var json = {
  coords: {}
};

var getA2s = function(city, callback) {
  var qq = generateCityQuery(city);
  asc.retry({ times: 10, interval: 500 }, function (innerCallback, results) {
    op(qq, function (err1, res1) {
      innerCallback(err1, res1);
    })
  }, function (fErr1, fRes1) {
    callback(fErr1, fRes1);
  });
};

// try calling apiMethod 3 times, waiting 200 ms between each retry
asc.retry({ times: 10, interval: 500 }, function (callback, results) {
  op(q1, function (err1, res1) {
    callback(err1, res1);
  })
}, function (fErr1, fRes1) {
  var features = fRes1.features;
  var obj = features[0];

  json.name = country;
  json.coords.lat = obj.geometry.coordinates[0];
  json.coords.lng = obj.geometry.coordinates[1];
  json.int_name = obj.properties.tags.int_name;
  json['name:en'] = obj.properties.tags['name:en'];

  // end of 1st phase

  asc.retry({ times: 10, interval: 500 }, function (callback, results) {
    op(q2, function (err2, res2) {
      callback(err2, res2);
    })
  }, function (fErr2, fRes2) {
    features = fRes2.features;
    json.administrative_area_level_1s = {};

    var count = 0;
    features.forEach(f => {
      var done = false;
      json.administrative_area_level_1s[f.properties.tags.name] = { coords: { lat: f.geometry.coordinates[0], lng: f.geometry.coordinates[1] } };

      getA2s(f.properties.tags.name, function (ero, reso) {
        var features2 = reso.features;
        json.administrative_area_level_1s[f.properties.tags.name].administrative_area_level_2s = {};

        features2.forEach(f2 => {
          json.administrative_area_level_1s[f.properties.tags.name].administrative_area_level_2s[f2.properties.tags.name] = { coords: { lat: f2.geometry.coordinates[0], lng: f2.geometry.coordinates[1] } };;
        });

        done = true;
        count++;
        console.log(count + '/' + features.length + '...');
      });


      require('deasync').loopWhile(() => !done);
    });

    jsonfile.writeFileSync('./data/' + short + '.json', json, { spaces: 2 });
  });
});
