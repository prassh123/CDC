var _ = require('lodash'),
    $q = require('q');

exports.getStats = function(req, res) {
  var query = req.query;
  console.log('getting stats ..', query);
  var race = query.race || 'all';
  var site = query.site || null;
  var rank = query.rank || null;
  var rate_gt = (query.rate_gt) || null;
  var rate_lt = (query.rate_lt) || null;

  parseFile().then(function(hash) {
    if (query.allstats) {
      console.log('came here');
      res.json(hash);
      return;
    }

    var filteredData = [];
    _.filter(hash, function(data) {
      var tmp = '';
      if (typeof data !== 'undefined') {
        /** race */
        if(!_.isEmpty(race)) {
          tmp = {
            rank: data.rank,
            site: data[race + '_site'],
            rate: parseFloat(data[race + '_rate'])
          };
        }
        /** end race */
        console.log('after race: ', tmp);

        /** site */
        if(!_.isEmpty(site)) {
          if(site.toLowerCase() !== tmp.site.toLowerCase()) {
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
          console.log('came here ', rate_gt, tmp.rate );
          if(parseFloat(rate_gt) > tmp.rate) {
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
};

function parseFile() {
  var deferred = $q.defer();
  var hash = [];
  var LineByLineReader = require('line-by-line'),
    lr = new LineByLineReader(__dirname + '/../../data/Table_M1.txt');

  lr.on('error', function (err) {
    console.log(err);
    deferred.reject(err);
  });

  lr.on('line', function (line) {
    // 'line' contains the current line without the trailing newline character.

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
        hash[obj.rank] = obj;
      }
    }
  });

  lr.on('end', function () {
    deferred.resolve(hash);
  });

  return deferred.promise;
}

var cleanse = function(string) {
  return string.replace(/"/g, '').trimLeft();
};