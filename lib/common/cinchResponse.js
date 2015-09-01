'use strict';

var _ = require('lodash'),
    omitEmpty = require('omit-empty'),
    url = require('url');

var CinchKit = require('../index');

class CinchResponse {
  constructor(request) {
    this.request = request;
  }

  getLinks() {
    var selfUrl = _.merge({}, url.parse(process.env.CINCH_SERVICE_API_ROOT), {
      pathname: this.request.url.pathname,
      query: this.request.url.query
    });

    var links = {
      self: url.format(selfUrl)
    };

    if (this.lastEvaluatedKey || this.after) {
      var after = this.lastEvaluatedKey ? CinchKit.serializeKeys(this.lastEvaluatedKey) : this.after;

      var nextQuery = _.merge({}, selfUrl.query, {after: after});
      var nextURL = _.merge({}, selfUrl, {query: nextQuery});
      links.next = url.format(nextURL);
    }

    return links;
  }

  getResponse() {
    var resp = {
      links: this.getLinks()
    };

    resp = _.merge({}, resp, this.data);
    resp.linked = this.linked;

    return omitEmpty(resp);
  }
}

module.exports = CinchResponse;
