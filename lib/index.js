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
    var _this = this;

    this.routes = new Routes(this.namespace, routesConfig);
    this.routes.injectApiRoot();
    return this.routes.generateRoutes(function (err) {
      if (err) {
        return callback(err);
      }

      _this.authManager = new AuthManager(_this.routes);
      _this.identityManager = new IdentityManager(_this.routes);
      _this.notificationManager = new NotificationManager(_this.routes);
      _this.photoManager = new PhotoManager(_this.routes);
      _this.socialManager = new SocialManager(_this.routes);

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
