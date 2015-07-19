'use strict';

var _ = require('lodash');

var RequestManager = require('./requestManager');


class AuthManager extends RequestManager {
  getAccounts(accountIds, opts, callback) {
    opts = opts || {};

    if (!_.isArray(accountIds)) {
      accountIds = [accountIds];
    }

    opts = _.merge({}, opts, {
      query: {ids: _.uniq(accountIds).join(',')}
    });

    var requestUrl = this.routes.url('searchAccounts', {}, opts);

    return this.makeRequest(requestUrl, {method: 'get'}, function (err, resp, body) {
      if (err) {
        return callback(err);
      }

      return callback(null, resp.statusCode === 200 ? body : null);
    });
  }
}

module.exports = AuthManager;
