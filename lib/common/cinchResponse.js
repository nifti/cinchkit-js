'use strict';

const _ = require('lodash');
const omitEmpty = require('omit-empty');
const url = require('url');

const CinchKit = require('../index');

// ----------

class CinchResponse {
  constructor(request) {
    this.request = request;
  }

  getLinks() {
    const selfUrl = _.merge({}, url.parse(process.env.CINCH_SERVICE_API_ROOT), {
      pathname: this.request.url.pathname,
      query: this.request.url.query
    });

    const links = {
      self: url.format(selfUrl)
    };

    if (this.lastEvaluatedKey || this.after) {
      const after = this.lastEvaluatedKey ? CinchKit.serializeKeys(this.lastEvaluatedKey) : this.after;

      const nextQuery = _.merge({}, selfUrl.query, {after: after});
      const nextURL = _.merge({}, selfUrl, {query: nextQuery});
      links.next = url.format(nextURL);
    }

    return links;
  }

  getResponse() {
    let resp = {
      links: this.getLinks()
    };

    resp = _.merge({}, resp, this.data);
    resp.linked = this.linked;

    return omitEmpty(resp);
  }
}

module.exports = CinchResponse;
