'use strict';

var _ = require('lodash'),
    boom = require('boom'),
    omitEmpty = require('omit-empty');

class CinchController {
  errorResponse(err, message, request, reply) {
    if (this.logger) {
      var errData = {
        path: request.path,
        query: request.query,
        payload: request.payload
      };

      this.logger.error({err: err, data: omitEmpty(errData)}, message);
    }

    return reply(boom.internal(message));
  }

  createConfigs(configs) {
    var _this = this;

    this.configs = {};

    _.each(configs, function (config, id) {
      config.id = id;
      _this.configs[id] = config;
    });
  }
}

module.exports = CinchController;
