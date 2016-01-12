'use strict';

var _ = require('lodash'),
    async = require('async');

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

  getAccountsChunk(opts, accountIds, callback) {
    opts = _.merge({}, opts, {
      query: {ids: accountIds.join(',')}
    });

    var requestUrl = this.routes.url('searchAccounts', {}, opts);
    return this.doRequest(requestUrl, {}, callback);
  }

  getAccounts(accountIds, opts, callback) {
    opts = opts || {};

    if (!_.isArray(accountIds)) {
      accountIds = [accountIds];
    }

    var accountsArray = _.chunk(_.uniq(accountIds), 25);
    var func = _.partial(this.getAccountsChunk, opts).bind(this);

    return async.map(accountsArray, func, function (err, results) {
      if (err) {
        return callback(err);
      }

      var accounts = _.chain(results).map('accounts').flatten().compact().value();
      return callback(null, {accounts: accounts});
    });
  }

  getAccountById(accountId, opts, callback) {
    opts = opts || {};

    var requestUrl = this.routes.url('getAccount', {accountId: accountId}, opts);
    return this.doRequest(requestUrl, {autorization: true}, callback);
  }

  getAccountByUsername(username, opts, callback) {
    opts = _.merge({}, opts, {
      query: {username: username}
    });

    var requestUrl = this.routes.url('searchAccounts', {}, opts);
    return this.doRequest(requestUrl, {}, callback);
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
}

module.exports = AuthManager;
