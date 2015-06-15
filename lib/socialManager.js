'use strict';

var _ = require('lodash');

var utils = require('./utils');


var internals = {};

internals.apiUri = 'http://socialservice-dev-hm2kug3mf3.elasticbeanstalk.com';

internals.getUserFollowers = function (accountId, callback) {
  var requestData = {
    pathname: '/accounts/' + accountId + '/followers',
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

internals.getGroupFollowers = function (groupId, callback) {
  var requestData = {
    pathname: '/groups/' + groupId + '/followers',
    method: 'GET',
    json: true
  };

  return utils.makeRequest(internals.apiUri, requestData, function (err, resp, body) {
    if (err) {
      return callback(err);
    }

    return callback(null, resp.statusCode === 200 ? body.followers : []);
  });
};

internals.getGroups = function (groupIds, callback) {
  if (!_.isArray(groupIds)) {
    groupIds = [groupIds];
  }

  var requestData = {
    pathname: '/groups/' + _.uniq(groupIds).join(','),
    method: 'GET',
    json: true
  };

  return utils.makeRequest(internals.apiUri, requestData, function (err, resp, body) {
    if (err) {
      return callback(err);
    }

    return callback(null, resp.statusCode === 200 ? body.groups : []);
  });
};

module.exports = {
  apiUri: internals.apiUri,
  getUserFollowers: internals.getUserFollowers,
  getGroupFollowers: internals.getGroupFollowers,
  getGroups: internals.getGroups
};
