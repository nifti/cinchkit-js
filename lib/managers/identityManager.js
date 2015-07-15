'use strict';

var _ = require('lodash');

var RequestManager = require('./requestManager');


class IdentityManager extends RequestManager {
  getPolls(pollIds, callback) {
    if (!_.isArray(pollIds)) {
      pollIds = [pollIds];
    }

    var requestUrl = this.routes.url('getDiscussions', {discussionId: _.uniq(pollIds).join(',')});

    return this.makeRequest(requestUrl, {method: 'get'}, function (err, resp, body) {
      if (err) {
        return callback(err);
      }

      return callback(null, resp.statusCode === 200 ? body.discussions : []);
    });
  }

  getCategories(callback) {
    var requestUrl = this.routes.url('getCategories');
    return this.makeRequest(requestUrl, {method: 'get'}, function (err, resp, body) {
      if (err) {
        return callback(err);
      }

      return callback(null, resp.statusCode === 200 ? body.categories : []);
    });
  }

  getPollsFromCategory(categoryId, callback) {
    var requestUrl = this.routes.url('getCategoryPolls', {categoryId: categoryId}, {
      query: {limit: 50}
    });

    return this.makeRequest(requestUrl, {method: 'get'}, function (err, resp, body) {
      if (err) {
        return callback(err);
      }

      return callback(null, resp.statusCode === 200 ? body.discussions : []);
    });
  }
}

module.exports = IdentityManager;
