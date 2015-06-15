'use strict';

var utils = require('./utils');


var internals = {};

internals.apiUri = 'http://notificationservice-dev-ypmnhvb6mb.elasticbeanstalk.com';

internals.sendNotification = function (accountFrom, data, callback) {
  var requestData = {
    pathname: '/accounts/' + accountFrom + '/notifications',
    method: 'POST',
    json: data
  };

  return utils.makeRequest(internals.apiUri, requestData, callback);
};

internals.removeNotification = function (data, callback) {
  var requestData = {
    pathname: '/notifications',
    method: 'DELETE',
    json: data
  };

  return utils.makeRequest(internals.apiUri, requestData, callback);
};

module.exports = {
  apiUri: internals.apiUri,
  sendNotification: internals.sendNotification,
  removeNotification: internals.removeNotification
};
