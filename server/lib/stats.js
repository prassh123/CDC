var _ = require('lodash'),
    $q = require('q'),
    utils = require('./utils');


var populateHashObj = function() {
  var hash = {};
  var deferred = $q.defer();
  utils.parseFile(hash).then(function(promises) {
    $q.all(promises).then(function() {
      deferred.resolve(hash);
    });
  });
  return deferred.promise;
};

exports.getYears = function(req, res) {
  populateHashObj().then(function(hash) {
    var years = Object.keys(hash);
    res.json(years);
  });
};

exports.getGender = function(req, res) {
  populateHashObj().then(function(hash) {
    var gender = Object.keys(hash['2011']);
    res.json(gender);
  });
};

exports.getRaces = function(req, res) {
  populateHashObj().then(function() {
    var races = utils.getRaceTypes();
    res.json(races);
  });
};

exports.getSites = function(req, res) {
  populateHashObj().then(function(hash) {
    var flattenedHash = require('flat').flatten(hash);
    var sites = {};
    _.filter(flattenedHash, function(data, key) {
      if (key.indexOf('_site') > -1) {
        sites[data] = key;
      }
    });
    res.json(_.keys(sites));
  });
};

exports.getStates = function(req, res) {
  populateHashObj().then(function(hash) {
    var states = Object.keys(hash['2011'].M);
    res.json(states);
  });
};

exports.getStats = function(req, res) {
  var query = req.query;
  console.log('getting stats ..', query);
  var year =  query.year || '2011';
  var state = query.state || 'all';

  var race = query.race || null;
  if(race && race.indexOf(',') > -1) {
    race = race.split(',');
    console.log(race);
  }

  var site = query.site || null;
  var rank = query.rank || null;
  var rate_gt = (query.rate_gt) || null;
  var rate_lt = (query.rate_lt) || null;

  var hash = {};
  utils.parseFile(hash).then(function(promises) {

    $q.all(promises).then(function() {
    if ((query.allstats)) {
      res.json(hash);
      return;
    }

    var filteredData = [];
    if (!_.isEmpty(state)) {
      hash = hash[year].M[state];
    }
    _.filter(hash, function(data) {
      var tmp = {};
      if (typeof data !== 'undefined') {

        if(!_.isEmpty(race)) {
          if(typeof race == 'object') {
            tmp = {};
            _.forEach(race, function(value) {
              value = value.toLowerCase();
              console.log('race value', value);
              tmp[value] = {
                race: value,
                rank: data.rank,
                site: data[value + '_site'],
                rate: parseFloat(data[value + '_rate'])
              };

            });
          } else {
            race = race.toLowerCase();
            tmp[race] = {
              race: race,
              rank: data.rank,
              site: data[race + '_site'],
              rate: parseFloat(data[race + '_rate'])
            };
          }

          console.log('tmp ', tmp);
        }
        /** end race */
        console.log('after race: ', tmp);

        /** site */
        if(!_.isEmpty(site) && site !== 'All Races Site') {
          race[0] = race[0].toLowerCase();
          console.log('here ', tmp[race[0]]);
          if(site.toLowerCase() !== tmp[race[0]].site.toLowerCase()) {
            return;
          }
        }
        /** end site */
        console.log('after site: ', tmp);

        /** rank */
        if(!_.isEmpty(rank)) {
          if(rank !== tmp.rank) {
            return;
          }
        }
        /* end rank */
        console.log('after rank: ', tmp);
        race[0] = race[0].toLowerCase();
        /** rate */
        if (!_.isEmpty(rate_lt)) {
          if(parseFloat(rate_lt) < tmp[race[0]].rate) {
            return;
          }
        }
        if (!_.isEmpty(rate_gt)) {
          if(parseFloat(rate_gt) > tmp[race[0]].rate) {
            console.log('returning ');
            return;
          }
        }
        /* end rate */
        console.log('after rate: ', tmp);
        filteredData.push(tmp);
      }

    });
    res.json(filteredData);
    });
  });
};

