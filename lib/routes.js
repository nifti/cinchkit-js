'use strict';

var _ = require('lodash'),
    async = require('async'),
    request = require('request'),
    url = require('url');


class Routes {
  constructor(namespace, routesConfig) {
    this.namespace = namespace;
    this.routesConfig = routesConfig;

    this.routes = {};

    this.serviceApiRoots = {
      as: process.env.CINCH_AUTH_SERVICE_API_ROOT,
      is: process.env.CINCH_IDENTITY_SERVICE_API_ROOT,
      ns: process.env.CINCH_NOTIFICATION_SERVICE_API_ROOT,
      ps: process.env.CINCH_PHOTO_SERVICE_API_ROOT,
      ss: process.env.CINCH_SOCIAL_SERVICE_API_ROOT
    };

    if (!this.serviceApiRoots[this.namespace]) {
      throw new Error('Given namespace (' + this.namespace + ') not found');
    }
  }

  generateRoutes(callback) {
    var self = this;

    _.each(this.serviceApiRoots, function (v, k) {
      self.routes[k] = {href: v};
    });

    this.generateLocalRoutes();

    // Temporarily create endpoints for auth-service
    this.routes['as:tokens'] = {href: this.serviceApiRoots.as + '/tokens'};
    this.routes['as:accounts'] = {href: this.serviceApiRoots.as + '/accounts/{accountId}'};
    this.routes['as:search'] = {href: this.serviceApiRoots.as + '/accounts'};

    // Temporarily create endpoints for photo-service
    this.routes['ps:photos'] = {href: this.serviceApiRoots.ps + '/photos/{photoId}'};
    this.routes['ps:transcodes'] = {href: this.serviceApiRoots.ps + '/transcodes'};
    this.routes['ps:createForAccount'] = {href: this.serviceApiRoots.ps + '/accounts/{accountId}/photos'};

    var func = function (namespace, callback) {
      if (namespace === self.namespace) {
        return callback();
      }

      var endpoint = self.serviceApiRoots[namespace];
      if (!endpoint) {
        var err = new Error('Can\'t find endpoint for given namespace (' + namespace + ')');
        return callback(err);
      }

      var requestData = {
        uri: endpoint,
        method: 'get',
        json: true
      };

      return request(requestData, function (err, resp, body) {
        if (err) {
          return callback(err);
        }

        if (resp.statusCode !== 200) {
          return callback();
        }

        _.each(body.resources, function (resource) {
          self.routes[resource.id] = {href: resource.href};
        });

        return callback();
      });
    };

    var namespaces = _.keys(this.serviceApiRoots);
    namespaces = _.without(namespaces, ['as', 'ps']);

    return async.each(namespaces, func, function (err) {
      return callback(err);
    });
  }

  generateLocalRoutes() {
    var self = this;

    _.forEach(self.routesConfig, function (item) {
      if (!item.config) {
        return;
      }

      if (item.config.auth && item.config.auth.scope.length === 1 && _.first(item.config.auth.scope) === 'admin') {
        return;
      }

      if (!item.config.id) {
        throw new Error('Given url (' + item.path + ') doesn\'t have id');
      }

      var id = self.namespace + ':' + item.config.id;

      if (self.routes[id]) {
        throw new Error('Url with given id (' + id + ') exists');
      }

      var route = {
        href: self.serviceApiRoots[self.namespace] + item.path
      };

      if (item.title) {
        route.title = item.title;
      }

      self.routes[id] = route;
    });
  }

  injectApiRoot() {
    var self = this;

    this.routesConfig.splice(0, 0, {method: 'GET', path: '/', handler: function (request, reply) {
      return reply({
        links: {self: self.serviceApiRoots[self.namespace]},
        resources: _.chain(self.routes).map(function (value, key) {
          if (key.indexOf(self.namespace) !== 0) {
            return null;
          }

          var route = {id: key};
          return _.merge({}, route, value);
        }).compact().value()
      });
    }});
  }

  url(id, args, params) {
    args = args || {};
    params = params || {};

    var routeTemplate = this.routes[id] ? this.routes[id].href : null;
    if (!routeTemplate) {
      throw new Error('Url with given id (' + id + ') not found');
    }

    var results;
    var endpoint = routeTemplate;
    var regexp = /\{(\w+)\}/g;

    while ((results = regexp.exec(routeTemplate)) !== null) {
        var argName = results[1];
        var replaceStr = args[argName];

        if (!replaceStr) {
          throw new Error('Given argument (' + argName + ') not found');
        }

        endpoint = encodeURIComponent(endpoint.replace(results[0], replaceStr));
    }

    endpoint = _.merge({}, url.parse(endpoint), params);
    return decodeURIComponent(url.format(endpoint));
  }
}

module.exports = Routes;
