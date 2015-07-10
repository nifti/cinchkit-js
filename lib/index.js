'use strict';

var hoek = require('hoek');

var AuthManager = require('./managers/authManager'),
    IdentityManager = require('./managers/identityManager'),
    NotificationManager = require('./managers/notificationManager'),
    PhotoManager = require('./managers/photoManager'),
    SocialManager = require('./managers/socialManager'),
    Routes = require('./routes');


class CinchKit {
  constructor(namespace) {
    this.namespace = namespace;
  }

  start(routesConfig, callback) {
    var self = this;

    this.routes = new Routes(this.namespace, routesConfig);
    this.routes.injectApiRoot();
    return this.routes.generateRoutes(function (err) {
      if (err) {
        return callback(err);
      }

      self.authManager = new AuthManager(self.routes);
      self.identityManager = new IdentityManager(self.routes);
      self.notificationManager = new NotificationManager(self.routes);
      self.photoManager = new PhotoManager(self.routes);
      self.socialManager = new SocialManager(self.routes);

      return callback();
    });
  }

  serializeKeys(keys) {
    if (!keys) {
      return null;
    }

    return hoek.base64urlEncode(JSON.stringify(keys));
  }

  deserializeKeys(keys) {
    return JSON.parse(hoek.base64urlDecode(keys));
  }
}

module.exports = CinchKit;
