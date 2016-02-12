'use strict';

const _ = require('lodash');
const async = require('async');

const RequestManager = require('./requestManager');

// ----------

class AccountManager extends RequestManager {
  doRequest(requestUrl, params, callback) {
    params = _.merge({}, {
      method: 'get'
    }, params);

    return this.makeRequest(requestUrl, params, (err, resp, body) => {
      if (err) {
        return callback(err);
      }

      return callback(null, resp.statusCode === 200 ? body : null);
    });
  }

  getAccountsChunk(opts, accountIds, callback) {
    opts = _.merge({}, opts, {
      query: {ids: accountIds.join(',')}
    });

    const requestUrl = this.routes.url('searchAccounts', {}, opts);
    return this.doRequest(requestUrl, {}, callback);
  }

  getAccounts(accountIds, opts, callback) {
    opts = opts || {};

    if (!_.isArray(accountIds)) {
      accountIds = [accountIds];
    }

    const accountsArray = _.chunk(_.uniq(accountIds), 25);
    const func = _.partial(this.getAccountsChunk, opts).bind(this);

    return async.map(accountsArray, func, (err, results) => {
      if (err) {
        return callback(err);
      }

      const accounts = _.chain(results).map('accounts').flatten().compact().value();
      return callback(null, {accounts: accounts});
    });
  }

  getAccountById(accountId, opts, callback) {
    opts = opts || {};

    const requestUrl = this.routes.url('getAccount', {accountId: accountId}, opts);
    return this.doRequest(requestUrl, {autorization: true}, callback);
  }

  getAccountByUsername(username, opts, callback) {
    opts = _.merge({}, opts, {
      query: {username: username}
    });

    const requestUrl = this.routes.url('searchAccounts', {}, opts);
    return this.doRequest(requestUrl, {}, callback);
  }

  getTokenForAccount(accountId, opts, callback) {
    opts = opts || {};

    const requestUrl = this.routes.url('createToken', {}, opts);
    const requestData = {
      method: 'post',
      json: {
        accountId: accountId
      }
    };

    return this.makeRequest(requestUrl, requestData, (err, resp, body) => {
      if (err) {
        return callback(err);
      }

      return callback(null, resp.statusCode === 201 ? body : null);
    });
  }

  getUserFollowers(accountId, opts, callback) {
    opts = opts || {};

    const requestUrl = this.routes.url('accountFollowers', {accountId: accountId}, opts);
    return this.makeRequest(requestUrl, {method: 'get'}, (err, resp, body) => {
      if (err) {
        return callback(err);
      }

      return callback(null, resp.statusCode === 200 ? body : null);
    });
  }

  getCategoryFollowers(categoryId, opts, callback) {
    opts = opts || {};

    const requestUrl = this.routes.url('categoryFollowers', {categoryId: categoryId}, opts);
    return this.makeRequest(requestUrl, {method: 'get'}, (err, resp, body) => {
      if (err) {
        return callback(err);
      }

      return callback(null, resp.statusCode === 200 ? body : null);
    });
  }

  followAccount(follow, accountId, resourceId, callback) {
    const urlName = follow ? 'followAccount' : 'unfollowAccount';
    const requestUrl = this.routes.url(urlName, {accountId: accountId});

    const params = {
      method: follow ? 'post' : 'delete',
      body: {
        accountId: resourceId
      }
    };

    return this.makeRequest(requestUrl, params, (err, resp, body) => {
      if (err) {
        return callback(err);
      }

      return callback(null, resp, body);
    });
  }

  getBlockedAccount(accountId, blockedAccountId, opts, callback) {
    opts = opts || {};

    const attrs = {
      accountId: accountId,
      blockedAccountId: blockedAccountId
    };

    const requestUrl = this.routes.url('getBlockedAccount', attrs, opts);

    const params = {
      method: 'get',
      autorization: true
    };

    return this.makeRequest(requestUrl, params, (err, resp, body) => {
      if (err) {
        return callback(err);
      }

      return callback(null, resp.statusCode === 200 ? body : null);
    });
  }

  checkFollowing(accountId, followingIds, opts, callback) {
    if (!_.isArray(followingIds)) {
      followingIds = [followingIds];
    }

    const requestUrl = this.routes.url('checkFollowing', {
      accountId: accountId,
      followingId: _.chain(followingIds).uniq().compact().value().join(',')
    });

    return this.makeRequest(requestUrl, {method: 'get'}, (err, resp, body) => {
      if (err) {
        return callback(err);
      }

      return callback(null, resp.statusCode === 200 ? body.accounts : []);
    });
  }
}

module.exports = AccountManager;
