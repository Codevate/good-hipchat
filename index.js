var Hipchatter = require('hipchatter');
var _ = require('lodash');
var Hoek = require('hoek');
var Squeeze = require('good-squeeze').Squeeze;

var defaults = {
  color: 'yellow',
  notify: false,
  format: function(event) {
    if (event.data && typeof event.data == 'string') {
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
  var message = {
    token: this._settings.roomToken,
    message: tagConfig.format ? tagConfig.format(eventData) : this._settings.format(eventData),
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
