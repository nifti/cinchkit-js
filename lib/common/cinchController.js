'use strict';

const _ = require('lodash');
const boom = require('boom');
const omitEmpty = require('omit-empty');

// ----------

class CinchController {
  errorResponse(err, message, request, reply) {
    if (this.logger) {
      const errData = {
        path: request.path,
        query: request.query,
        payload: request.payload
      };

      this.logger.error({err: err, data: omitEmpty(errData)}, message);
    }

    return reply(boom.internal(message));
  }

  createConfigs(configs) {
    this.configs = {};

    _.each(configs, (config, id) => {
      config.id = id;
      this.configs[id] = config;
    });
  }
}

module.exports = CinchController;
