'use strict';

var RequestManager = require('./requestManager');


class NotificationManager extends RequestManager {
  getByTypeAction(accountTo, type, action, opts, callback) {
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

  sendNotification(accountTo, data, callback) {
    var requestUrl = this.routes.url('sendNotification', {accountId: accountTo});
    var params = {
      method: 'post',
      json: data
    };

    return this.makeRequest(requestUrl, params, callback);
  }

  removeNotification(data, callback) {
    var requestUrl = this.routes.url('removeNotification');
    var params = {
      method: 'delete',
      json: data
    };

    return this.makeRequest(requestUrl, params, callback);
  }
}

module.exports = NotificationManager;
