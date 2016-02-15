'use strict';

const hoek = require('hoek');

const AccountManager = require('./managers/accountManager');
const NotificationManager = require('./managers/notificationManager');
const PollManager = require('./managers/pollManager');
const Routes = require('./routes');

// ----------

class CinchKit {
  constructor(namespace) {
    this.namespace = namespace;
  }

  start(routesConfig, callback) {
    this.routes = new Routes(this.namespace, routesConfig);
    this.routes.injectApiRoot();

    return this.routes.generateRoutes((err) => {
      if (err) {
        return callback(err);
      }

      this.accountManager = new AccountManager(this.routes);
      this.notificationManager = new NotificationManager(this.routes);
      this.pollManager = new PollManager(this.routes);

      return callback();
    });
  }

  static serializeKeys(keys) {
    if (!keys) {
      return null;
    }

    return hoek.base64urlEncode(JSON.stringify(keys));
  }

  static deserializeKeys(keys) {
    return JSON.parse(hoek.base64urlDecode(keys));
  }
}

module.exports = CinchKit;
