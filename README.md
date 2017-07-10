# good-hipchat

`good-hipchat` is a write stream for notifying a Hipchat room of [good](https://github.com/hapijs/good) events using [hipchatter](https://github.com/charltoons/hipchatter).

![Current Version](https://img.shields.io/npm/v/good-hipchat.svg)

## Usage

Use as part of a stream pipeline when creating a [reporter](https://github.com/hapijs/good/tree/efd3755ba3d8ceced624a7da981d123524e60b7d#example-usage). For example, here's a minimal configuration to send all error events to `myRoom`:

```js
myHipchatErrorReporter: [
  {
    module: 'good-squeeze',
    name: 'Squeeze',
    args: [{ error: '*', log: ['error'], request: ['error'] }]
  },
  {
    module: 'good-hipchat',
    args: [{
      room:      'myRoom',
      authToken: 'myAuthToken',
      roomToken: 'myRoomToken'
    }]
  }
]
```

> See [Hipchat's documentation on API access](https://developer.atlassian.com/hipchat/guide/hipchat-rest-api/api-access-tokens#APIaccesstokens-Usergeneratedtokens) for more information on how to create auth and room tokens.

Check out this [minimal Hapi application](example/index.js) for a more in-depth example that overrides default behaviour such as the formatting of messages using the [event payload](https://github.com/hapijs/good/blob/efd3755ba3d8ceced624a7da981d123524e60b7d/API.md#event-payloads).

> See [Hipchat's documentation on sending messages](https://developer.atlassian.com/hipchat/guide/sending-messages) for more information on what types of formatting is supported.
