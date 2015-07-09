'use strict';

var hoek = require('hoek');

var AuthManager = require('./managers/authManager'),
    IdentityManager = require('./managers/identityManager'),
    NotificationManager = require('./managers/notificationManager'),
    PhotoManager = require('./managers/photoManager'),
    SocialManager = require('./managers/socialManager'),
    Routes = require('./routes');


class CinchKit {
  constructor(namespace, routesConfig) {
    this.namespace = namespace
  }

  start(routesConfig, callback) {
    this.routes = new Routes(this.namespace, routesConfig);
    this.routes.injectApiRoot();
    this.routes.generateRoutes(callback);

    this.authManager = new AuthManager(this.routes);
    this.identityManager = new IdentityManager(this.routes);
    this.notificationManager = new NotificationManager(this.routes);
    this.photoManager = new PhotoManager(this.routes);
    this.socialManager = new SocialManager(this.routes);
  };

  serializeKeys(keys) {
    if (!keys) {
      return null;
    }

    return hoek.base64urlEncode(JSON.stringify(keys));
  };

  deserializeKeys(keys) {
    return JSON.parse(hoek.base64urlDecode(keys));
  };
};

module.exports = CinchKit;
