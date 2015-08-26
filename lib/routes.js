'use strict';

var _ = require('lodash'),
    aws = require('aws-sdk'),
    url = require('url');


class Routes {
  constructor(namespace, routesConfig) {
    this.namespace = namespace;

    this.serviceApiRoot = process.env.CINCH_SERVICE_API_ROOT;
    this.routesConfig = routesConfig;

    this.routes = {};
    this.localRoutes = {};

    this.s3 = new aws.S3({apiVersion: '2006-03-01'});
    this.s3params = {
      Bucket: process.env.CINCH_BUCKET,
      Key: 'routes.json'
    };
  }

  generateRoutes(callback) {
    var _this = this;

    this.generateLocalRoutes();
    this.routes = _.merge({}, this.routes, this.localRoutes);

    return this.s3.getObject(this.s3params, function (err, data) {
      if (err) {
        return callback(err);
      }

      var json = JSON.parse(data.Body);

      _.each(json.resources, function (route) {
        if (route.namespace === _this.namespace) {
          return;
        }

        if (_this.routes[route.id]) {
          throw new Error(`Url with id '${route.id}' exists`);
        }

        _this.routes[route.id] = {href: route.href};
      });

      return _this.saveRoutes(json, callback);
    });
  }

  saveRoutes(json, callback) {
    var _this = this;

    var newResources = _.filter(json.resources, function (resource) {
      return resource.namespace !== _this.namespace;
    });

    _.each(this.localRoutes, function (v, k) {
      var attrs = {
        id: k,
        href: v.href,
        namespace: _this.namespace
      };

      if (v.title) {
        attrs.title = v.title;
      }

      newResources.push(attrs);
    });

    json.resources = newResources;

    var params = _.cloneDeep(this.s3params);
    params.Body = JSON.stringify(json);
    return this.s3.putObject(params, callback);
  }

  generateLocalRoutes() {
    var _this = this;

    _.forEach(_this.routesConfig, function (item) {
      var conf = item.config;

      if (!conf) {
        return;
      }

      if (conf.auth && conf.auth.scope.length === 1 && _.first(conf.auth.scope) === 'admin') {
        return;
      }

      var id = conf.id;

      if (!id) {
        throw new Error(`Id not found for ${item.path}`);
      }

      if (_this.routes[id]) {
        throw new Error(`Url with id '${id}' exists`);
      }

      var route = {
        href: _this.serviceApiRoot + item.path
      };

      if (item.title) {
        route.title = item.title;
      }

      _this.localRoutes[id] = route;
    });
  }

  injectApiRoot() {
    var _this = this;

    this.routesConfig.splice(0, 0, {method: 'GET', path: '/', handler: function (request, reply) {
      return reply({
        links: {self: _this.serviceApiRoot},
        resources: _.chain(_this.localRoutes).map(function (value, key) {
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
      throw new Error(`Url with id '${id}' not found`);
    }

    var results;
    var endpoint = routeTemplate;
    var regexp = /\{(\w+)\}/g;

    while ((results = regexp.exec(routeTemplate)) !== null) {
        var argName = results[1];
        var replaceStr = args[argName];

        if (!replaceStr) {
          var errMsg = `Argument ${argName} not found in ${routeTemplate}. Possible arguments ${JSON.stringify(args)}`;
          throw new Error(errMsg);
        }

        endpoint = endpoint.replace(results[0], replaceStr);
    }

    endpoint = encodeURIComponent(endpoint);
    endpoint = _.merge({}, url.parse(endpoint), params);
    return decodeURIComponent(url.format(endpoint));
  }
}

module.exports = Routes;
