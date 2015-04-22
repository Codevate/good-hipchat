var Hipchatter = require('hipchatter');
var _ = require('lodash');
var Hoek = require('hoek');
var Squeeze = require('good-squeeze').Squeeze;

var defaults = {
  color: 'yellow',
  notify: false,
  prefix: '',
  suffix: '',
  format: function(event) {
    if (event.event == 'response') {
      var query = (event.query) ? JSON.stringify(event.query) : '';
      var response = '';
      if (event.responsePayload && typeof event.responsePayload == 'object' && event.responsePayload.message) {
        response = event.responsePayload.message;
      }
      return Hoek.format('%s: %s %s %s %s (%sms) <b>%s</b>', event.instance, event.method, event.path, query, event.statusCode, event.responseTime, response);
    } else if (event.data && typeof event.data == 'string') {
      return event.data;
    } else if (event.message) {
      return event.message;
    } else if (event.error) {
      return event.error.toString();
    } else {
      return JSON.stringify(event);
    }
  }
};

var GoodHipchat = function(events, config) {

  if (!(this instanceof GoodHipchat)) {
    return new GoodHipchat(events, config);
  }

  config = config || {};
  Hoek.assert(config.authToken, 'config.authToken must exist');
  Hoek.assert(config.roomToken, 'config.roomToken must exist');
  Hoek.assert(config.room, 'config.room must exist');

  var settings = Hoek.applyToDefaults(defaults, config);

  this._streams = {
    squeeze: Squeeze(events)
  };
  this._eventQueue = [];
  this._settings = settings;

};

GoodHipchat.prototype.init = function(stream, emitter, callback) {

  var self = this;
  this.hipchat = new Hipchatter(this._settings.authToken);

  this._streams.squeeze.on('data', function (data) {
    self.report(data);
  });

  stream.pipe(this._streams.squeeze);


  return callback();
};

GoodHipchat.prototype.report = function(eventData) {
  var eventConfig = this._settings.customizeEvents[eventData.event] || {};
  var tagConfig = {};

  if (eventConfig['*']) {
    tagConfig = eventConfig['*'];
  } else {
    _.each(eventData.tags, function(tag) {
      if (eventConfig[tag]) {
        tagConfig = eventConfig[tag];
      }
    });
  }

  if (eventData.event == 'response' && this._settings.responseCodes && this._settings.responseCodes.indexOf(eventData.statusCode) == -1) {
    return;
  }

  var formatFn = tagConfig.format || this._settings.format;
  var messageArray = [];
  if (this._settings.prefix) {
    messageArray.push(this._settings.prefix);
  }
  messageArray.push(formatFn(eventData));
  if (this._settings.suffix) {
    messageArray.push(this._settings.suffix);
  }
  var message = {
    token: this._settings.roomToken,
    message: messageArray.join(' '),
    notify: (typeof tagConfig.notify !== 'undefined') ? tagConfig.notify : this._settings.notify,
    color: tagConfig.color || this._settings.color
  };

  this.hipchat.notify(this._settings.room, message, function(err) {
    if(err) {
      console.log('Error sending message to room', err);
    }
  });
};

module.exports = GoodHipchat;
