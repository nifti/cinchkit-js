'use strict';

const _ = require('lodash');
const request = require('request');
const url = require('url');

// ----------

class RequestManager {
  constructor(routes) {
    this.cinchAdminAccessToken = null;
    this.routes = routes;
  }

  makeRequest(endpoint, params, callback) {
    const requestUrl = _.merge({}, url.parse(endpoint), params.query || {});
    delete params.query;

    const withAuthorization = !!params.autorization;
    delete params.autorization;

    const attemptCount = params.attemptCount || 1;
    delete params.attemptCount;

    const requestData = _.defaults({}, params, {
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
      return this.updateAccessToken(() => {
        return this.makeRequest(endpoint, params, callback);
      });
    }

    return request(requestData, (err, resp, body) => {
      if (err) {
        if (_.includes(['ETIMEDOUT', 'ESOCKETTIMEDOUT'], err.code) && attemptCount < 3) {
          params.attemptCount = attemptCount + 1;
          return this.makeRequest(endpoint, params, callback);
        }

        return callback(err);
      }

      if (resp.statusCode === 401) {
        this.cinchAdminAccessToken = null;

        return this.updateAccessToken(() => {
          return this.makeRequest(endpoint, params, callback);
        });
      }

      return callback(null, resp, body);
    });
  }

  updateAccessToken(callback) {
    const requestUrl = this.routes.url('createToken');

    const params = {
      method: 'post',
      headers: {
        Authorization: 'Bearer ' + process.env.CINCH_SERVICES_REFRESH_TOKEN
      }
    };

    return this.makeRequest(requestUrl, params, (err, resp, body) => {
      if (err) {
        return callback(err);
      }

      if (resp.statusCode !== 201) {
        err = new Error('Failed to update access token. Status code: ' + resp.statusCode);
        return callback(err);
      }

      this.cinchAdminAccessToken = _.first(body.tokens).access;
      return callback();
    });
  }
}

module.exports = RequestManager;
