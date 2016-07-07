'use strict';

var op = require('query-overpass');
var asc = require('async');
var jsonfile = require('jsonfile');
var _ = require('lodash');
var request = require('request');
var tr = require('tor-request');
var Agent = require('socks5-http-client/lib/Agent');
var inputs = process.argv.slice(2);
var country = inputs[0];
var countryAdmin = inputs[1];
var cityAdminLevel = inputs[2];
var districtAdminLevel = inputs[3];

var qRoot = 'http://overpass-api.de/api/interpreter';
var qOpts = {
  url: qRoot,
  agentClass: Agent,
  agentOptions: {
    socksHost: 'localhost',
    socksPort: 9050
  }
};

var clearQOpts = {
  url: 'http://overpass-api.de/api/kill_my_queries',
  agentClass: Agent,
  agentOptions: {
    socksHost: 'localhost',
    socksPort: 9050
  }
};

var countryAreaQ = '[out:json][timeout:100];rel[name="' + country + '"][admin_level=' + countryAdmin + '];out geom;';

var generateAreaQ = function (areaId, adminLevel) {
  return '[out:json][timeout:100];(rel[type="boundary"][admin_level=' + adminLevel + '](area:' + areaId + '););out geom;'
}

var json = {};

// try calling OSM api call 10 times, waiting 500 ms between each retry
asc.retry({ times: 10, interval: 500 }, function (callback1, results1) {
  request.post(qRoot, function (err1, res1, body1) {
    if (body1.charAt(0) === '<' || !body1 || err1) {
      callback1(true, null);
    } else {
      callback1(err1, body1);
    }
  }).form({
    data: countryAreaQ
  })
}, function (fErr1, fRes1) {
  fRes1 = JSON.parse(fRes1);
  var e1 = fRes1.elements[0];
  var countryAreaId = e1.id + 3600000000;
  json.name = country;
  json.bounds = e1.bounds;
  json.int_name = e1.tags.int_name;
  json.code = e1.tags['ISO3166-1'];

  // end of 1st phase

  asc.retry({ times: 10, interval: 500 }, function (callback2, results2) {
    console.log('Q: ' + generateAreaQ(countryAreaId, cityAdminLevel));
    request.post(qOpts, function (err2, res2, body2) {
      if (res2.statusCode === 429) {
        console.log('Clearing queries..');
        request.get(clearQOpts, function () {
          callback2(true, null);
        });
      } else if (body2.charAt(0) === '<' || !body2 || err2) {
        callback2(true, null);
      } else {
        callback2(err2, body2);
      }
    }).form({
      data: generateAreaQ(countryAreaId, cityAdminLevel)
    })
  }, function (fErr2, fRes2) {
    fRes2 = JSON.parse(fRes2);
    json.administrative_area_level_1s = {};

    var count = 0;
    fRes2.elements.forEach(function (e) {
      var done = false;
      json.administrative_area_level_1s[e.tags.name] = {};
      json.administrative_area_level_1s[e.tags.name].bounds = e.bounds;
      json.administrative_area_level_1s[e.tags.name].administrative_area_level_2s = {};
      var cityAreaId = e.id + 3600000000;

      asc.retry({ times: 10, interval: 500 }, function (callback3, results3) {
        console.log('Q: ' + generateAreaQ(cityAreaId, districtAdminLevel));
        request.post(qOpts, function (err3, res3, body3) {
          if (res3.statusCode === 429) {
            console.log('Clearing queries..');
            request.get(clearQOpts, function () {
              callback3(true, null);
            });
          } else if (body3.charAt(0) === '<' || !body3 || err3) {
            callback3(true, null);
          } else {
            callback3(err3, body3);
          }
        }).form({
          data: generateAreaQ(cityAreaId, districtAdminLevel)
        })
      }, function (fErr3, fRes3) {
        fRes3 = JSON.parse(fRes3);

        fRes3.elements.forEach(function (dist) {
          json.administrative_area_level_1s[e.tags.name].administrative_area_level_2s[dist.tags.name] = {};
          json.administrative_area_level_1s[e.tags.name].administrative_area_level_2s[dist.tags.name].bounds = dist.bounds;
        });

        count++;
        console.log(count + '/' + fRes2.elements.length + '...');
        done = true;
      });

      require('deasync').loopWhile(() => !done);
    });

    jsonfile.writeFileSync('./data/' + json.code + '.json', json, { spaces: 2 });
  });
});
