'use strict';

var _ = require('lodash');

var RequestManager = require('./requestManager');


class PhotoManager extends RequestManager {
  getPhotos(photoIds, opts, callback) {
    opts = opts || {};

    if (!_.isArray(photoIds)) {
      photoIds = [photoIds];
    }

    // if photoIds contains only one photoId, request won't return json,
    // so we need to add one fake photoId (0)
    photoIds.push('0');

    var requestUrl = this.routes.url('photos', {photoId: _.uniq(photoIds).join(',')}, opts);

    return this.makeRequest(requestUrl, {method: 'get'}, function (err, resp, body) {
      if (err) {
        return callback(err);
      }

      return callback(null, resp.statusCode === 200 ? body);
    });
  }

  transcodeCandidate(notifyUrl, outputs, accountId, photoId, callback) {
    callback = callback || _.noop;

    var requestUrl = this.routes.url('transcodes');

    var params = {
      method: 'post',
      json: {
        photoId: photoId,
        accountId: accountId,
        notifyUrl: notifyUrl,
        outputs: outputs
      }
    };

    return this.makeRequest(requestUrl, params, function (err, resp) {
      if (err) {
        return callback(err);
      }

      if (resp.statusCode !== 200 && resp.statusCode !== 201) {
        return callback(new Error('Failed to transcode photo. Status code: ' + resp.statusCode));
      }

      return callback();
    });
  }
}

module.exports = PhotoManager;
