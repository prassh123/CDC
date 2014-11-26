var stats = require('./lib/stats');

module.exports = {
  apply: function(server) {


    server.get('/api/stats/', stats.getStats);

    server.get('/', function(req, res) {
      res.setHeader('content-type', 'application-json');
      res.json({msg: 'Keep calm and code on! All is well.'});
    });

    return server;
  }
};
