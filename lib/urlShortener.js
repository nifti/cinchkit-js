'use strict';

const _ = require('lodash');
const aws = require('aws-sdk');
const url = require('url');

// ----------

class CinchUrlShortener {
  constructor() {
    this.s3 = new aws.S3({apiVersion: '2006-03-01'});
    this.urlDomain = process.env.CINCH_URL_DOMAIN;
    this.bucket = process.env.CINCH_URL_BUCKET;
    this.isInitialized = this.urlDomain && this.bucket;
  }

  shortenLink(longLink, callback) {
    if (!this.isInitialized) {
      const err = new Error('Url shortener not initialized');
      return callback(err);
    }

    const key = (+new Date()).toString();

    const params = {
      Bucket: this.bucket,
      Key: key,
      Body: '',
      ACL: 'public-read',
      ContentType: 'text/plain',
      WebsiteRedirectLocation: longLink
    };

    return this.s3.putObject(params, (err) => {
      if (err) {
        return callback(err);
      }

      return callback(null, `${this.urlDomain}/${key}`);
    });
  }

  removeLink(shortLink, callback) {
    callback = callback || _.noop;

    const params = {
      Bucket: this.bucket,
      Key: this.getKey(shortLink),
    };

    return this.s3.deleteObject(params, (err) => {
      if (err) {
        return callback(err);
      }

      return callback(null, null);
    });
  }

  getLongLink(shortLink, callback) {
    const params = {
      Bucket: this.bucket,
      Key: this.getKey(shortLink),
    };

    return this.s3.getObject(params, (err, data) => {
      if (err) {
        if (err.code === 'NoSuchKey') {
          return callback(null, null);
        }

        return callback(err);
      }

      return callback(null, data.WebsiteRedirectLocation || null);
    });
  }

  getKey(shortLink) {
    return url.parse(shortLink).pathname.slice(1);
  }
}

module.exports = CinchUrlShortener;
