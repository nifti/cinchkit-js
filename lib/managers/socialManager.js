'use strict';

var async = require('async');

var RequestManager = require('./requestManager');


class SocialManager extends RequestManager {
  getUserFollowers(accountId, callback) {
    var _this = this;

    var followers = [];
    var nextLink = this.routes.url('findFollowers', {accountId: accountId});

    var testFunc = function () {
      return !!nextLink;
    };

    var func = function (callback) {
      return _this.makeRequest(nextLink, {method: 'get'}, function (err, resp, body) {
        if (err) {
          return callback(err);
        }

        if (resp.statusCode === 200) {
          nextLink = body.links.next;
          followers = followers.concat(body.accounts);
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
  }
}

module.exports = SocialManager;
