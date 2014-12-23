var Hapi = require('hapi');
var server = new Hapi.Server();
server.connection({ host: 'localhost', port: 8000 });

var options = {
  opsInterval: 1000,
  reporters: [{
    reporter: require('../'),
    args:[
      { log: '*', response: '*' },
      {
        auth_token: '1234',
        room: 'Room',
        roomToken: '1234',
        color: 'red',
        debug: true
      }
    ]
  }]
};

server.register({
  register: require('good'),
  options: options
}, function (err) {
  if (err) {
    console.error(err);
  } else {
    server.start(function () {
      console.info('Server started at ' + server.info.uri);
    });
  }

  setTimeout(function() {
    server.log(['error'], 'Test error');
  }, 15000);
});