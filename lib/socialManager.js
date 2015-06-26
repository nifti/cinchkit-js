'use strict';

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

module.exports = {
  apiUri: internals.apiUri,
  getUserFollowers: internals.getUserFollowers
};
