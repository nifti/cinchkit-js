'use strict';

var _ = require('lodash');

var utils = require('./utils');


var internals = {};

internals.apiUri = 'http://identityservice-dev-peystnaps3.elasticbeanstalk.com';

internals.getPolls = function (pollIds, callback) {
  if (!_.isArray(pollIds)) {
    pollIds = [pollIds];
  }

  var requestData = {
    pathname: '/discussions/' + _.uniq(pollIds).join(','),
    method: 'GET',
    json: true
  };

  return utils.makeRequest(internals.apiUri, requestData, function (err, resp, body) {
    if (err) {
      return callback(err);
    }

    return callback(null, resp.statusCode === 200 ? body.discussions : []);
  });
};

internals.getCategories = function (callback) {
  var requestData = {
    pathname: '/categories',
    method: 'GET',
    json: true
  };

  return utils.makeRequest(internals.apiUri, requestData, function (err, resp, body) {
    if (err) {
      return callback(err);
    }

    return callback(null, resp.statusCode === 200 ? body.categories : []);
  });
};

internals.getPollsFromCategory = function (categoryId, callback) {
  var requestData = {
    pathname: '/categories/' + categoryId + '/discussions',
    query: 'limit=50',
    method: 'GET',
    json: true
  };

  return utils.makeRequest(internals.apiUri, requestData, function (err, resp, body) {
    if (err) {
      return callback(err);
    }

    return callback(null, resp.statusCode === 200 ? body.discussions : []);
  });
};

module.exports = {
  apiUri: internals.apiUri,
  getPolls: internals.getPolls,
  getCategories: internals.getCategories,
  getPollsFromCategory: internals.getPollsFromCategory
};
