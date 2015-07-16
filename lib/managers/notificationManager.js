'use strict';

var RequestManager = require('./requestManager');


class NotificationManager extends RequestManager {
  getByTypeAction(accountTo, type, action, callback) {
    var requestUrl = this.routes.url('getByTypeAction', {
      accountTo: accountTo,
      type: type,
      action: action
    });

    return this.makeRequest(requestUrl, {method: 'get'}, callback);
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
