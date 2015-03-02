var Hapi = require('hapi');
var server = new Hapi.Server();
server.connection({ host: 'localhost', port: 8000 });

var options = {
  opsInterval: 1000,
  reporters: [{
    reporter: require('../'),
    args:[
      {
        auth_token: '1234',
        room: 'Devs',
        roomToken: '1234',
        debug: true,
        events: {
          'error': {
            '*': {
              color: 'red',
              room: 'Emergency Ops',
              roomToken: '56w34',
              notify: true,
              format: function(event) {
                return event.error.toString() + ' Details: http://example.com?e=something';
              }
            }
          },
          'log': {
            'example': {
              color: 'yellow',
              format: function(event) {
                return event.data;
              }
            },
            'error': {
              color: 'red',
              format: function(event) {
                return event.data;
              }
            }
          },
        }
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

  server.route({
    method: 'GET',
    path: '/',
    handler: function(request, reply) {
      server.log(['error', 'example'], 'Should only display once');
      server.log(['example'], 'Example again');
      server.log(['not-used'], 'This shouldn\'t be logged');
      server.log(['social-meta', 'twitter', 'error'], { url: 'url', error: new Error('something') });
      reply(new Error('something'));
    }
  });
});