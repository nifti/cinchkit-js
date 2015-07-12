'use strict';

var RequestManager = require('./requestManager');


class NotificationManager extends RequestManager {
  sendNotification(accountTo, data, callback) {
    var requestUrl = this.routes.url('ns:send', {accountId: accountTo});
    var params = {
      method: 'post',
      json: data
    };

    return this.makeRequest(requestUrl, params, callback);
  }

  removeNotification(data, callback) {
    var requestUrl = this.routes.url('ns:remove');
    var params = {
      method: 'delete',
      json: data
    };

    return this.makeRequest(requestUrl, params, callback);
  }
}

module.exports = NotificationManager;
