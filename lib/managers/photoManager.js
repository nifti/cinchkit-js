'use strict';

var _ = require('lodash');

var RequestManager = require('./requestManager');


class PhotoManager extends RequestManager {
  getPhotos(photoIds, opts, callback) {
    opts = opts || {};
    opts = _.merge({}, opts, {
      query: {redirect: false}
    });

    if (!_.isArray(photoIds)) {
      photoIds = [photoIds];
    }

    var requestUrl = this.routes.url('photos', {photoId: _.uniq(photoIds).join(',')}, opts);

    return this.makeRequest(requestUrl, {method: 'get'}, function (err, resp, body) {
      if (err) {
        return callback(err);
      }

      return callback(null, resp.statusCode === 200 ? body: null);
    });
  }

  getTranscodes(transcodeIds, opts, callback) {
    opts = opts || {};

    if (!_.isArray(transcodeIds)) {
      transcodeIds = [transcodeIds];
    }

    var requestUrl = this.routes.url('getTranscodes', {transcodeId: _.uniq(transcodeIds).join(',')}, opts);

    return this.makeRequest(requestUrl, {method: 'get'}, function (err, resp, body) {
      if (err) {
        return callback(err);
      }

      return callback(null, resp.statusCode === 200 ? body: null);
    });
  }
}

module.exports = PhotoManager;
