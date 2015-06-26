'use strict';

var async = require('async'),
    url = require('url');

var utils = require('./utils');


var internals = {};

internals.apiUri = 'http://socialservice-dev-hm2kug3mf3.elasticbeanstalk.com';

internals.getUserFollowers = function (accountId, callback) {
  var followers = [];
  var nextLink = '/accounts/' + accountId + '/followers';
  var query = null;

  var testFunc = function () {
    return !!nextLink;
  };

  var func = function (callback) {
    var requestData = {
      pathname: nextLink,
      query: query,
      method: 'GET',
      json: true
    };

    return utils.makeRequest(internals.apiUri, requestData, function (err, resp, body) {
      if (err) {
        return callback(err);
      }

      if (resp.statusCode === 200) {
        followers = followers.concat(body.accounts);

        if (body.links.next) {
          var next = url.parse(body.links.next);
          nextLink = next.pathname;
          query = next.query;
        } else {
          nextLink = null;
        }
      }

      return callback();
    });
  };

  return async.whilst(testFunc, func, function (err) {
    if (err) {
      return callback(err);
    }

    return callback(null, followers);
  });
};

module.exports = {
  apiUri: internals.apiUri,
  getUserFollowers: internals.getUserFollowers
};
