var Hapi = require('hapi');
var Boom = require('boom');
var server = new Hapi.Server();
server.connection({ host: 'localhost', port: 8000 });

var config = require('./config.json');

var options = {
  opsInterval: 1000,
  responsePayload: true,
  reporters: [{
    reporter: require('../'),
    events: {
      error: '*',
      log: ['example', 'error'],
      response: '*'
    },
    config: {
      authToken: config.authToken,
      roomToken: config.roomToken,
      room: 'Test',
      prefix: 'This is a prefix',
      suffix: '<a href="http://google.com">Suffix</a>',
      responseCodes: [401],
      customizeEvents: {
        'error': {
          '*': {
            color: 'red',
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
              return 'ERROR: '+ event.data;
            }
          }
        },
      }
    }
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
      server.log(['info'], 'Server started at ' + server.info.uri);
    });
  }

  server.route([{
      method: 'GET',
      path: '/',
      handler: function(request, reply) {
        reply('ok');
      }
    }, {
      method: 'GET',
      path: '/error-example',
      handler: function(request, reply) {
        server.log(['error', 'example'], 'Should only display once');
        reply('ok');
      }
    }, {
      method: 'GET',
      path: '/error',
      handler: function(request, reply) {
        reply(new Error('ooops'));
      }
    }, {
      method: 'GET',
      path: '/unauthorized',
      handler: function(request, reply) {
        reply('nope').code(401);
      }
    }, {
      method: 'GET',
      path: '/boom',
      handler: function(request, reply) {
        reply(Boom.unauthorized('Not allowed'));
      }
    }


  ]);
});
