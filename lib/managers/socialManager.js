'use strict';

var RequestManager = require('./requestManager');


class SocialManager extends RequestManager {
  getUserFollowers(accountId, opts, callback) {
    opts = opts || {};

    var requestUrl = this.routes.url('accountFollowers', {accountId: accountId}, opts);

    return this.makeRequest(requestUrl, {method: 'get'}, function (err, resp, body) {
      if (err) {
        return callback(err);
      }

      return callback(null, resp.statusCode === 200 ? body : null);
    });
  }
}

module.exports = SocialManager;
