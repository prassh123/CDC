var _ = require('lodash'),
  $q = require('q'),
  fs = require('fs');


function getRaceTypes() {
  return ['All', 'White', 'Black', 'Asian', 'American', 'Hispanic'];
}

var cleanse = function(string) {
  return string.replace(/"/g, '').trimLeft();
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
        all_site: cleanse(data.shift()),
        all_rate: cleanse(data.shift()),
        white_site: cleanse(data.shift()),
        white_rate: cleanse(data.shift()),
        black_site: cleanse(data.shift()),
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

module.exports = {
  getRaceTypes: getRaceTypes,
  cleanse: cleanse,
  parseFile: parseFile,
  readFile: readFile
};