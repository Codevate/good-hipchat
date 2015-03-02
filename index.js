var GoodReporter = require('good-reporter');
var Hipchatter = require('hipchatter');
var _ = require('lodash-node');
var Hoek = require('hoek');
var chalk = require('chalk');

var defaults = {
  color: 'yellow',
  notify: false,
  debug: false,
  format: function(event) {
    if(event.message) {
      return event.message;
    } else if(event.error) {
      return event.error.toString();
    } else {
      return event;
    }
  },
  events: {}
};

var GoodHipchat = function(options) {

  this.options = Hoek.clone(options);

  this.options = Hoek.applyToDefaults(defaults, this.options);

  var events = {};

  for(var event in this.options.events) {
    if(this.options.events[event]['*']) {
      events[event] = '*';
      continue;
    }

    events[event] = Object.keys(this.options.events[event]);
  }

  this.reporter = new GoodReporter(events);

  this.reporter._report = this._report.bind(this);
  this.reporter.start = this.start.bind(this);
  this.reporter.stop = this.stop.bind(this);
};

GoodHipchat.prototype.start = function(emitter, callback) {
  emitter.on('report', this.reporter._handleEvent.bind(this.reporter));

  this.hipchat = new Hipchatter(this.options.auth_token);

  return callback();
};

GoodHipchat.prototype.stop = function(){};

GoodHipchat.prototype._report = function(event, eventData) {
  var eventConfig = this.options.events[event];
  var tagConfig = {};

  if(eventConfig['*']) {
    tagConfig = eventConfig['*'];
  } else {
    _.each(eventData.tags, function(tag) {
      if (typeof eventConfig[tag] !== undefined) {
        tagConfig = eventConfig[tag];
      }
    });
  }

  var message = {
    token: tagConfig.roomToken || this.options.roomToken,
    message: tagConfig.format ? tagConfig.format(eventData) : this.options.format(eventData),
    notify: (typeof tagConfig.notify !== 'undefined') ? tagConfig.notify : this.options.notify,
    color: tagConfig.color || this.options.color
  };

  if(this.options.debug) {
    console.log(chalk.bold[message.color]('Message to room:', tagConfig.room || this.options.room));
    console.log(message);
  } else {
    this.hipchat.notify(tagConfig.room || this.options.room, message, function(err) {
      if(err) {
        console.log('Error sending message to room', err);
      }
    });
  }
};

module.exports = GoodHipchat;