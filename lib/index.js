'use strict';

var hoek = require('hoek');

var authManager = require('./authManager'),
    identityManager = require('./identityManager'),
    notificationManager = require('./notificationManager'),
    photoManager = require('./photoManager'),
    socialManager = require('./socialManager');


var internals = {};

internals.serializeKeys = function (keys) {
  if (!keys) {
    return null;
  }

  return hoek.base64urlEncode(JSON.stringify(keys));
};

internals.deserializeKeys = function (keys) {
  return JSON.parse(hoek.base64urlDecode(keys));
};

module.exports = {
  // Utils
  serializeKeys: internals.serializeKeys,
  deserializeKeys: internals.deserializeKeys,

  // Api uris
  authServiceApiUri: authManager.apiUri,
  identityServiceApiUri: identityManager.apiUri,
  notificationServiceApiUri: notificationManager.apiUri,
  photoServiceApiUri: photoManager.apiUri,
  socialServiceApiUri: socialManager.apiUri,

  // Account manager
  getAccounts: authManager.getAccounts,

  // Identity manager
  getPolls: identityManager.getPolls,
  getCategories: identityManager.getCategories,
  getPollsFromCategory: identityManager.getPollsFromCategory,

  // Notification manager
  sendNotification: notificationManager.sendNotification,
  removeNotification: notificationManager.removeNotification,

  // Photos manager
  getPhotos: photoManager.getPhotos,
  transcodeCandidate: photoManager.transcodeCandidate,

  // Social manager
  getUserFollowers: socialManager.getUserFollowers,
  getGroupFollowers: socialManager.getGroupFollowers,
  getGroups: socialManager.getGroups
};
