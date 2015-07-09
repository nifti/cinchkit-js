'use strict';

var _ = require('lodash');

var RequestManager = require('./requestManager');


class AuthManager extends RequestManager {
  getAccounts(accountIds, callback) {
    if (!_.isArray(accountIds)) {
      accountIds = [accountIds];
    }

    var requestUrl = this.routes.url('as:search', {}, {
      query: {ids: _.uniq(accountIds).join(',')}
    });

    return this.makeRequest(requestUrl, {method: 'get'}, function (err, resp, body) {
      if (err) {
        return callback(err);
      }

      return callback(null, resp.statusCode === 200 ? body.accounts : []);
    });
  }
}

module.exports = AuthManager;
