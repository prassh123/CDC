var stats = require('./lib/stats');

module.exports = {
  apply: function(server) {

    server.get('/api/years/', stats.getYears);
    server.get('/api/gender/', stats.getGender);
    server.get('/api/states/', stats.getStates);
    server.get('/api/races/', stats.getRaces);
    server.get('/api/sites/', stats.getSites);
    server.get('/api/stats/', stats.getStats);

    server.get('/', function(req, res) {
      res.setHeader('content-type', 'application-json');
      res.json({msg: 'Keep calm and code on! All is well.'});
    });

    return server;
  }
};
