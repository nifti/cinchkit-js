'use strict';

var _ = require('lodash');

var utils = require('./utils');


var internals = {};

internals.apiUri = 'http://cinchauth-dev-krttxjjzkv.elasticbeanstalk.com';

internals.getAccounts = function (accountIds, callback) {
  if (!_.isArray(accountIds)) {
    accountIds = [accountIds];
  }

  var requestData = {
    pathname: '/accounts',
    query: {ids: _.uniq(accountIds).join(',')},
    method: 'GET',
    json: true
  };

  return utils.makeRequest(internals.apiUri, requestData, function (err, resp, body) {
    if (err) {
      return callback(err);
    }

    return callback(null, resp.statusCode === 200 ? body.accounts : []);
  });
};

internals.updateAccessToken = function (callback) {
  var requestData = {
    pathname: '/tokens',
    method: 'POST',
    json: true,
    headers: {
      Authorization: 'Bearer ' + process.env.CINCH_SERVICES_REFRESH_TOKEN
    }
  };

  return utils.makeRequest(internals.apiUri, requestData, function (err, resp, body) {
    if (err) {
      return callback(err);
    }

    if (resp.statusCode !== 201) {
      err = new Error('Failed to update access token. Status code: ' + resp.statusCode);
      return callback(err);
    }

    process.env.CINCH_ADMIN_ACCESS_TOKEN = _.first(body.tokens).access;
    return callback();
  });
};

module.exports = {
  apiUri: internals.apiUri,
  getAccounts: internals.getAccounts,
  updateAccessToken: internals.updateAccessToken
};
