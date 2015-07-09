'use strict';

var _ = require('lodash'),
    request = require('request'),
    url = require('url');


class RequestManager {
  constructor(routes) {
    this.cinchAdminAccessToken = null;
    this.routes = routes;
  }

  makeRequest(endpoint, params, callback) {
    var self = this;

    var requestUrl = _.merge({}, url.parse(endpoint), params.query || {});
    delete params.query;

    var requestData = _.defaults({}, params, {
      method: 'get',
      uri: url.format(requestUrl),
      timeout: 3500,
      json: true
    });

    if (this.cinchAdminAccessToken) {
      requestData.headers = {
        Authorization: 'Bearer ' + this.cinchAdminAccessToken
      };
    }

    return request(requestData, function (err, resp, body) {
      if (err) {
        return callback(err);
      }

      if (resp.statusCode === 401) {
        self.cinchAdminAccessToken = null;

        return self.updateAccessToken(function () {
          return self.makeRequest(url, params, callback);
        });
      }

      return callback(null, resp, body);
    });
  }

  updateAccessToken(callback) {
    var self = this;

    var requestUrl = this.routes.url('as:tokens');
    var params = {
      method: 'post',
      headers: {
        Authorization: 'Bearer ' + process.env.CINCH_SERVICES_REFRESH_TOKEN
      }
    };

    return this.makeRequest(requestUrl, params, function (err, resp, body) {
      if (err) {
        return callback(err);
      }

      if (resp.statusCode !== 201) {
        err = new Error('Failed to update access token. Status code: ' + resp.statusCode);
        return callback(err);
      }

      self.cinchAdminAccessToken = _.first(body.tokens).access;
      return callback();
    });
  }
}

module.exports = RequestManager;