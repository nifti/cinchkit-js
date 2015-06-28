'use strict';

var _ = require('lodash');

var utils = require('./utils');


var internals = {};

internals.apiUri = 'http://api.us-east-1.niftiws.com';

internals.getPhotos = function (photoIds, callback) {
  if (!_.isArray(photoIds)) {
    photoIds = [photoIds];
  }

  // if id contains only one photoId, request won't return json,
  // so we need to add one fake photoId (0)
  photoIds.push('0');

  var requestData = {
    pathname: '/photos/' + _.uniq(photoIds).join(','),
    method: 'GET',
    json: true
  };

  return utils.makeRequest(internals.apiUri, requestData, function (err, resp, body) {
    if (err) {
      return callback(err);
    }

    return callback(null, resp.statusCode === 200 ? body.photos : []);
  });
};

internals.transcodeCandidate = function (notifyUrl, outputs, accountId, photoId, callback) {
  callback = callback || _.noop;

  var requestData = {
    pathname: '/transcodes',
    method: 'POST',
    json: {
      photoId: photoId,
      accountId: accountId,
      notifyUrl: notifyUrl,
      outputs: outputs
    }
  };

  return utils.makeRequest(internals.apiUri, requestData, function (err, resp) {
    if (err) {
      return callback(err);
    }

    if (resp.statusCode !== 200 && resp.statusCode !== 201) {
      var errMessage = 'Failed to transcode photo. Status code: ' + resp.statusCode;
      return callback(new Error(errMessage));
    }

    return callback();
  });
};

module.exports = {
  apiUri: internals.apiUri,
  getPhotos: internals.getPhotos,
  transcodeCandidate: internals.transcodeCandidate
};
