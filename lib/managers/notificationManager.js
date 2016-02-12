'use strict';

const RequestManager = require('./requestManager');

// ----------

class NotificationManager extends RequestManager {
  getByTypeAction(accountTo, type, action, opts, callback) {
    opts = opts || {};

    const params = {
      accountId: accountTo,
      type: type,
      action: action
    };

    const requestUrl = this.routes.url('getByTypeAction', params, opts);
    return this.makeRequest(requestUrl, {method: 'get'}, (err, resp, body) => {
      if (err) {
        return callback(err);
      }

      return callback(null, resp.statusCode === 200 ? body : null);
    });
  }
}

module.exports = NotificationManager;
