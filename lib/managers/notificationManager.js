'use strict';

var RequestManager = require('./requestManager');


class NotificationManager extends RequestManager {
  getByTypeAction(accountTo, type, action, opts, callback) {
    opts = opts || {};

    var params = {
      accountId: accountTo,
      type: type,
      action: action
    };

    var requestUrl = this.routes.url('getByTypeAction', params, opts);

    return this.makeRequest(requestUrl, {method: 'get'}, function (err, resp, body) {
      if (err) {
        return callback(err);
      }

      return callback(null, resp.statusCode === 200 ? body : null);
    });
  }
}

module.exports = NotificationManager;
