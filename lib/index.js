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

      const accountManager = new AccountManager(this.routes);
      this.getAccountsChunk = accountManager.getAccountsChunk;
      this.getAccounts = accountManager.getAccounts;
      this.getAccountById = accountManager.getAccountById;
      this.getAccountByUsername = accountManager.getAccountByUsername;
      this.getTokenForAccount = accountManager.getTokenForAccount;
      this.getUserFollowers = accountManager.getUserFollowers;
      this.getCategoryFollowers = accountManager.getCategoryFollowers;
      this.followAccount = accountManager.followAccount;
      this.getBlockedAccount = accountManager.getBlockedAccount;
      this.checkFollowing = accountManager.checkFollowing;

      const notificationManager = new NotificationManager(this.routes);
      this.getByTypeAction = notificationManager.getByTypeAction;

      const pollManager = new PollManager(this.routes);
      this.getPolls = pollManager.getPolls;
      this.getCategories = pollManager.getCategories;
      this.getPollsFromCategory = pollManager.getPollsFromCategory;
      this.getAccountPolls = pollManager.getAccountPolls;

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
