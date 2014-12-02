var _ = require('lodash'),
    $q = require('q'),
    fs = require('fs'),
    utils = require('./utils');
    //flatten = require('flat');

var populateHashObj = function() {
  var hash = {};
  var deferred = $q.defer();
  parseFile(hash).then(function(promises) {
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
  parseFile(hash).then(function(promises) {

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
              //tmp.push({
              //  race: value,
              //  rank: data.rank,
              //  site: data[value + '_site'],
              //  rate: parseFloat(data[value + '_rate'])
              //});

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

        /** rate */
        if (!_.isEmpty(rate_lt)) {
          if(parseFloat(rate_lt) < tmp.rate) {
            return;
          }
        }
        if (!_.isEmpty(rate_gt)) {
          if(parseFloat(rate_gt) > tmp.rate) {
            console.log('returning ');
            return;
          }
        }
        /* end rate */
        console.log('after rate: ', tmp);
        filteredData.push(tmp);
      }
      //return;
    });
    res.json(filteredData);
    });
  });
};

function parseFile(hash) {
  var readFilePromises = [];
  var deferred = $q.defer();

  fs.readdir(__dirname + '/../../data',function(err,files){
    if (err) {
      console.log(err);
      throw err;
    }
    files.forEach(function(file){
      readFilePromises.push(readFile(file, hash));
    });
    deferred.resolve(readFilePromises);
  });

  return deferred.promise;
}

function readFile(file, hash) {
  var filePromise = $q.defer();

  //console.log('file name ', file);
  var parts = file.split('_');
  var year = parts[1];
  var gender = parts[2];
  var state = parts[3].split('.')[0];
  var LineByLineReader = require('line-by-line'),
    lr = new LineByLineReader(__dirname + '/../../data/' + file);

  lr.on('error', function (err) {
    console.log(err);
    deferred.reject(err);
  });

  lr.on('line', function (line) {
    // 'line' contains the current line
    // without the trailing newline character.

    var data = line.split('\t');
    if (data.length > 1) {
      data.shift(); // ignore first empty column

      var obj = {
        rank: cleanse(data.shift()),
        all_site:    cleanse(data.shift()),
        all_rate: cleanse(data.shift()),
        white_site: cleanse(data.shift()),
        white_rate: cleanse(data.shift()),
        black_site:  cleanse(data.shift()),
        black_rate: cleanse(data.shift()),
        asian_site: cleanse(data.shift()),
        asian_rate: cleanse(data.shift()),
        american_site: cleanse(data.shift()),
        american_rate: cleanse(data.shift()),
        hispanic_site: cleanse(data.shift()),
        hispanic_rate: cleanse(data.shift())
      };

      if (!_.isEmpty(obj)) {
        hash[year] = hash[year] || {};
        hash[year][gender] = hash[year][gender] || {};
        hash[year][gender][state] = hash[year][gender][state] || [];
        hash[year][gender][state][obj.rank] = obj;

      }
    }
  });

  lr.on('end', function() {
    // check if all files are added and then resolve the promise
    filePromise.resolve();
  });
  return filePromise.promise;
}

var cleanse = function(string) {
  return string.replace(/"/g, '').trimLeft();
};