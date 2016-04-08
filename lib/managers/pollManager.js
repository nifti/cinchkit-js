'use strict';

const _ = require('lodash');

const RequestManager = require('./requestManager');

// ----------

class PollManager extends RequestManager {
  getPolls(pollIds, opts, callback) {
    opts = opts || {};

    if (!_.isArray(pollIds)) {
      pollIds = [pollIds];
    }

    const requestUrl = this.routes.url('getDiscussions', {discussionId: _.uniq(pollIds).join(',')}, opts);
    return this.makeRequest(requestUrl, {method: 'get'}, (err, resp, body) => {
      if (err) {
        return callback(err);
      }

      return callback(null, resp.statusCode === 200 ? body : null);
    });
  }

  getCategories(opts, callback) {
    opts = opts || {};

    const requestUrl = this.routes.url('getCategories', {}, opts);
    return this.makeRequest(requestUrl, {method: 'get'}, (err, resp, body) => {
      if (err) {
        return callback(err);
      }

      return callback(null, resp.statusCode === 200 ? body : null);
    });
  }

  getPollsFromCategory(categoryId, opts, callback) {
    opts = opts || {};

    const requestUrl = this.routes.url('getCategoryPolls', {categoryId: categoryId}, opts);
    return this.makeRequest(requestUrl, {method: 'get'}, (err, resp, body) => {
      if (err) {
        return callback(err);
      }

      return callback(null, resp.statusCode === 200 ? body : null);
    });
  }

  getAccountPolls(accountId, opts, callback) {
    opts = opts || {};

    const requestUrl = this.routes.url('getAccountDiscussions', {accountId: accountId}, opts);
    return this.makeRequest(requestUrl, {method: 'get'}, (err, resp, body) => {
      if (err) {
        return callback(err);
      }

      return callback(null, resp.statusCode === 200 ? body : null);
    });
  }

  getPhotos(photoIds, opts, callback) {
    opts = opts || {};
    opts = _.merge({}, opts, {
      query: {redirect: false}
    });

    if (!_.isArray(photoIds)) {
      photoIds = [photoIds];
    }

    var requestUrl = this.routes.url('photos', {photoId: _.uniq(photoIds).join(',')}, opts);

    return this.makeRequest(requestUrl, {method: 'get'}, (err, resp, body) => {
      if (err) {
        return callback(err);
      }

      return callback(null, resp.statusCode === 200 ? body: null);
    });
  }
}

module.exports = PollManager;
