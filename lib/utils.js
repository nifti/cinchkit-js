'use strict';

var _ = require('lodash'),
    request = require('request'),
    url = require('url');


var internals = {};

internals.makeRequest = function (apiUri, requestData, callback) {
  var originalRequestData = _.cloneDeep(requestData);

  var requestUrl = _.merge({}, url.parse(apiUri), {
    pathname: requestData.pathname,
    query: requestData.query
  });

  delete requestData.pathname;
  delete requestData.query;

  requestData.uri = url.format(requestUrl);
  requestData.timeout = 3500;

  if (process.env.CINCH_ADMIN_ACCESS_TOKEN) {
    requestData.headers = {
      Authorization: 'Bearer ' + process.env.CINCH_ADMIN_ACCESS_TOKEN
    };
  }

  return request(requestData, function (err, resp, body) {
    if (err) {
      return callback(err);
    }

    if (resp.statusCode === 401) {
      // Hello, circular dependencies
      var authManager = require('./authManager');

      delete process.env.CINCH_ADMIN_ACCESS_TOKEN;

      return authManager.updateAccessToken(function () {
        return internals.makeRequest(apiUri, originalRequestData, callback);
      });
    }

    return callback(null, resp, body);
  });
};

module.exports = {
  makeRequest: internals.makeRequest
};
