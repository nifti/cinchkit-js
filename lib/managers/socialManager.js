'use strict';

var _ = require('lodash');

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

  getBlockedAccount(accountId, blockedAccountId, opts, callback) {
    opts = opts || {};

    var attrs = {
      accountId: accountId,
      blockedAccountId: blockedAccountId
    };

    var requestUrl = this.routes.url('getBlockedAccount', attrs, opts);
    this.doRequest(requestUrl, {autorization: true}, callback);
  }

  checkFollowing(accountId, followingIds, opts, callback) {
    if (!_.isArray(followingIds)) {
      followingIds = [followingIds];
    }

    var requestUrl = this.routes.url('checkFollowing', {
      accountId: accountId,
      followingId: _.chain(followingIds).uniq().compact().value().join(',')
    });

    return this.makeRequest(requestUrl, {method: 'get'}, function (err, resp, body) {
      if (err) {
        return callback(err);
      }

      return callback(null, resp.statusCode === 200 ? body.accounts : []);
    });
  }
}

module.exports = SocialManager;
