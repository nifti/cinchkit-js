'use strict';

var _ = require('lodash');

var RequestManager = require('./requestManager');


class IdentityManager extends RequestManager {
  getPolls(pollIds, opts, callback) {
    opts = opts || {};

    if (!_.isArray(pollIds)) {
      pollIds = [pollIds];
    }

    var requestUrl = this.routes.url('getDiscussions', {discussionId: _.uniq(pollIds).join(',')}, opts);

    return this.makeRequest(requestUrl, {method: 'get'}, function (err, resp, body) {
      if (err) {
        return callback(err);
      }

      return callback(null, resp.statusCode === 200 ? body : {});
    });
  }

  getCategories(opts, callback) {
    opts = opts || {};

    var requestUrl = this.routes.url('getCategories', {}, opts);

    return this.makeRequest(requestUrl, {method: 'get'}, function (err, resp, body) {
      if (err) {
        return callback(err);
      }

      return callback(null, resp.statusCode === 200 ? body : {});
    });
  }

  getPollsFromCategory(categoryId, opts, callback) {
    opts = opts || {};

    var requestUrl = this.routes.url('getCategoryPolls', {categoryId: categoryId}, opts);

    return this.makeRequest(requestUrl, {method: 'get'}, function (err, resp, body) {
      if (err) {
        return callback(err);
      }

      return callback(null, resp.statusCode === 200 ? body : {});
    });
  }
}

module.exports = IdentityManager;
