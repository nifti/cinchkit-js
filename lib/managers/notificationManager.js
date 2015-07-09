'use strict';

var RequestManager = require('./requestManager');


class NotificationManager extends RequestManager {
  sendNotification(accountFrom, data, callback) {
    var requestUrl = this.routes.url('ns:send', {accountId: accountFrom});
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
