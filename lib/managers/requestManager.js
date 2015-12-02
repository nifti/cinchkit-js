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
    var _this = this;

    var requestUrl = _.merge({}, url.parse(endpoint), params.query || {});
    delete params.query;

    var withAuthorization = !!params.autorization;
    delete params.autorization;

    var attemptCount = params.attemptCount || 1;
    delete params.attemptCount;

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
    } else if (withAuthorization) {
      return this.updateAccessToken(function () {
        return _this.makeRequest(endpoint, params, callback);
      });
    }

    return request(requestData, function (err, resp, body) {
      if (err) {
        return callback(err);
      }

      if (resp.statusCode === 401) {
        _this.cinchAdminAccessToken = null;

        return _this.updateAccessToken(function () {
          return _this.makeRequest(endpoint, params, callback);
        });
      }

      if (resp.statusCode === 503 && attemptCount < 3) {
        params.attemptCount = attemptCount + 1;
        return _this.makeRequest(endpoint, params, callback);
      }

      return callback(null, resp, body);
    });
  }

  updateAccessToken(callback) {
    var _this = this;

    var requestUrl = this.routes.url('createToken');

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

      _this.cinchAdminAccessToken = _.first(body.tokens).access;
      return callback();
    });
  }
}

module.exports = RequestManager;
