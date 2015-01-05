var GoodReporter = require('good-reporter');
var Hipchatter = require('hipchatter');
var _ = require('lodash-node');
var Hoek = require('hoek');
var chalk = require('chalk');

var defaults = {
  tags: [],
  color: 'yellow',
  notify: false,
  debug: false,
  formatMessage: function(event) {
    if(event.message) {
      return event.message;
    } else if(event.error) {
      return event.error.toString();
    } else {
      return event;
    }
  }
};

var GoodHipchat = function(events, options) {

  this.options = Hoek.clone(options);

  this.options = Hoek.applyToDefaults(defaults, this.options);

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
  var tags = _.intersection(this.options.tags, eventData.tags);

  if(!tags.length && this.options.tags.length) {
    return;
  }

  var text = '';

  var message = {
    token: this.options.roomToken,
    message: this.options.formatMessage(eventData),
    notify: this.options.notify,
    color: this.options.color
  };

  if(this.options.debug) {
    console.log(chalk.bold.red('Message Data:'));
    console.log(message);
    console.log(chalk.bold.red('Event Data:'));
    console.log(eventData);
  } else {
    this.hipchat.notify(this.options.room, message, function(err) {
      if(err) {
        console.log('Error sending message to room', err);
      }
    });
  }
};

module.exports = GoodHipchat;