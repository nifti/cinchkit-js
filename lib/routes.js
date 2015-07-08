'use strict';

var _ = require('lodash'),
    url = require('url');


class Routes {
  constructor(namespace, routesConfig, logger) {
    this.namespace = namespace;
    this.routesConfig = routesConfig;
    this.logger = logger;

    this.routes = {};

    if (process.env.DEBUG.toLowerCase() === 'true') {
      this.serviceApiRoots = {
        as: 'http://cinchauth-dev-krttxjjzkv.elasticbeanstalk.com',
        is: 'http://identityservice-dev-peystnaps3.elasticbeanstalk.com',
        ns: 'http://notificationservice-dev-ypmnhvb6mb.elasticbeanstalk.com',
        ps: 'http://api.us-east-1.niftiws.com',
        ss: 'http://socialservice-dev-hm2kug3mf3.elasticbeanstalk.com'
      };
    }

    if (!this.serviceApiRoots[this.namespace]) {
      throw new Error('Given namespace (' + this.namespace + ') not found');
    }
  };

  generateRoutes(callback) {
    var self = this;

    _.each(this.serviceApiRoots, function (v, k) {
      self.routes[k] = {href: v};
    });

    this.generateLocalRoutes();

    // Temporarily create endpoints for auth-service
    this.routes['as:tokens'] = {href: this.serviceApiRoots['as'] + '/tokens'}
    this.routes['as:accounts'] = {href: this.serviceApiRoots['as'] + '/accounts/{accountId}'}
    this.routes['as:search'] = {href: this.serviceApiRoots['as'] + '/accounts'}

    // Temporarily create endpoints for notification-service
    this.routes['ns:send'] = {href: this.serviceApiRoots['ns'] + '/accounts/{accountId}/notifications'}
    this.routes['ns:remove'] = {href: this.serviceApiRoots['ns'] + '/notifications'}

    // Temporarily create endpoints for photo-service
    this.routes['ps:photos'] = {href: this.serviceApiRoots['ps'] + '/photos/{photoId}'}
    this.routes['ps:transcodes'] = {href: this.serviceApiRoots['ps'] + '/transcodes'}

    // Temporarily create endpoints for social-service
    this.routes['ss:findFollowers'] = {href: this.serviceApiRoots['ss'] + '/accounts/{accountId}/followers'}

    return callback();
  };

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
        self.logger.warn('Url (' + item.path + ') doesn\'t have id');
        return;
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
  };

  injectApiRoot() {
    var self = this;

    this.routesConfig.splice(0, 0, {method: 'GET', path: '/', handler: function (request, reply) {
      return reply({
        links: {self: self.serviceApiRoots[self.namespace]},
        resources: _.chain(self.routes).map(function (value, key) {
          var route = {id: key};
          return _.merge({}, route, value)
        }).sortBy('id').value()
      });
    }});
  };

  url(id, args, params) {
    args = args || {};
    params = params || {};

    var routeTemplate = this.routes[id] ? this.routes[id].href : null
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

        endpoint = endpoint.replace(results[0], replaceStr);
    }

    endpoint = _.merge({}, url.parse(endpoint), params);
    return url.format(endpoint);
  };
};

module.exports = Routes;
