'use strict';

var _ = require('lodash');

var RequestManager = require('./requestManager');


class AuthManager extends RequestManager {
  doRequest(requestUrl, params, callback) {
    params = _.merge({}, {
      method: 'get'
    }, params);

    return this.makeRequest(requestUrl, params, function (err, resp, body) {
      if (err) {
        return callback(err);
      }

      return callback(null, resp.statusCode === 200 ? body : null);
    });
  }

  getAccounts(accountIds, opts, callback) {
    opts = opts || {};

    if (!_.isArray(accountIds)) {
      accountIds = [accountIds];
    }

    opts = _.merge({}, opts, {
      query: {ids: _.uniq(accountIds).join(',')}
    });

    var requestUrl = this.routes.url('searchAccounts', {}, opts);
    this.doRequest(requestUrl, {}, callback);
  }

  getAccountById(accountId, opts, callback) {
    opts = opts || {};

    var requestUrl = this.routes.url('getAccount', {accountId: accountId}, opts);
    this.doRequest(requestUrl, {autorization: true}, callback);
  }

  getAccountByUsername(username, opts, callback) {
    opts = _.merge({}, opts, {
      query: {username: username}
    });

    var requestUrl = this.routes.url('searchAccounts', {}, opts);
    this.doRequest(requestUrl, {}, callback);
  }

  getTokenForAccount(accountId, opts, callback) {
    opts = opts || {};

    var requestUrl = this.routes.url('createToken', {}, opts);
    var requestData = {
      method: 'post',
      json: {
        accountId: accountId
      }
    };

    return this.makeRequest(requestUrl, requestData, function (err, resp, body) {
      if (err) {
        return callback(err);
      }

      return callback(null, resp.statusCode === 201 ? body : null);
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
}

module.exports = AuthManager;
