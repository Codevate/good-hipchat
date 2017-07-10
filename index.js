const Hipchatter = require('hipchatter');
const _ = require('lodash');
const Hoek = require('hoek');
const Stream = require('stream');

const defaults = {
  color: 'yellow',
  notify: false,
  prefix: '',
  suffix: '',
  customizeEvents: {},
  format: (event) => {
    if (event.event == 'response') {
      const query = (event.query) ? JSON.stringify(event.query) : '';
      let response = '';
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

class GoodHipchat extends Stream.Writable {
  constructor(config) {

    super({ objectMode: true, decodeStrings: false });

    config = config || {};
    Hoek.assert(config.authToken, 'config.authToken must exist');
    Hoek.assert(config.roomToken, 'config.roomToken must exist');
    Hoek.assert(config.room, 'config.room must exist');

    this._settings = Hoek.applyToDefaults(defaults, config);
    this.hipchat = new Hipchatter(this._settings.authToken);
  }

  _write(eventData, encoding, callback) {
    const eventConfig = this._settings.customizeEvents[eventData.event] || {};
    let tagConfig = {};

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
      return callback();
    }

    const formatFn = tagConfig.format || this._settings.format;
    const messageArray = [];
    if (this._settings.prefix) {
      messageArray.push(this._settings.prefix);
    }
    messageArray.push(formatFn(eventData));
    if (this._settings.suffix) {
      messageArray.push(this._settings.suffix);
    }
    const message = {
      token: this._settings.roomToken,
      message: messageArray.join(' '),
      notify: (typeof tagConfig.notify !== 'undefined') ? tagConfig.notify : this._settings.notify,
      color: tagConfig.color || this._settings.color
    };

    this.hipchat.notify(this._settings.room, message, callback);
  }
};

module.exports = GoodHipchat;
