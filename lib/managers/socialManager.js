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

  getCategoryFollowers(categoryId, opts, callback) {
    opts = opts || {};

    var requestUrl = this.routes.url('categoryFollowers', {categoryId: categoryId}, opts);

    return this.makeRequest(requestUrl, {method: 'get'}, function (err, resp, body) {
      if (err) {
        return callback(err);
      }

      return callback(null, resp.statusCode === 200 ? body : null);
    });
  }

  followAccount(follow, accountId, resourceId, callback) {
    var urlName = follow ? 'followAccount' : 'unfollowAccount';
    var requestUrl = this.routes.url(urlName, {accountId: accountId});

    var params = {
      method: follow ? 'post' : 'delete',
      body: {
        accountId: resourceId
      }
    };

    return this.makeRequest(requestUrl, params, function (err, resp, body) {
      if (err) {
        return callback(err);
      }

      return callback(null, resp, body);
    });
  }
}

module.exports = SocialManager;
