var Hapi = require('hapi');
var server = new Hapi.Server();
server.connection({ host: 'localhost', port: 8000 });

var options = {
  opsInterval: 1000,
  reporters: [{
    reporter: require('../'),
    events: {
      error: '*',
      log: ['example', 'error']
    },
    config: {
      authToken: 'daaf19ba00ad0953b546dec76a2761',
      roomToken: 'TjyIN1cvptamObk4sKf8ZXyQtd0AnoiIgKhboB0K',
      room: 'Test',
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
        server.log(['example'], 'Example');
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
    },

  ]);
});
