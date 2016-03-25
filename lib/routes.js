'use strict';

const _ = require('lodash');
const aws = require('aws-sdk');
const url = require('url');

// ----------

class Routes {
  constructor(namespace, routesConfig) {
    this.namespace = namespace;

    this.serviceApiRoot = process.env.CINCH_SERVICE_API_ROOT;
    this.routesConfig = routesConfig;

    this.routes = {};
    this.localRoutes = {};

    this.s3 = new aws.S3({apiVersion: '2006-03-01'});
    this.s3params = {
      Bucket: process.env.CINCH_PRIVATE_BUCKET,
      Key: 'routes.json'
    };
  }

  generateRoutes(callback) {
    this.generateLocalRoutes();
    this.routes = _.merge({}, this.routes, this.localRoutes);

    return this.s3.getObject(this.s3params, (err, data) => {
      if (err) {
        return callback(err);
      }

      const json = JSON.parse(data.Body);

      _.each(json.resources, (route) => {
        if (route.namespace === this.namespace) {
          return;
        }

        if (this.routes[route.id]) {
          throw new Error(`Url with id '${route.id}' exists`);
        }

        this.routes[route.id] = {href: route.href};
      });

      return this.saveRoutes(json, callback);
    });
  }

  saveRoutes(json, callback) {
    const newResources = _.filter(json.resources, (resource) => {
      return resource.namespace !== this.namespace;
    });

    _.each(this.localRoutes, (v, k) => {
      const attrs = {
        id: k,
        href: v.href,
        namespace: this.namespace
      };

      if (v.title) {
        attrs.title = v.title;
      }

      newResources.push(attrs);
    });

    json.resources = newResources;

    const params = _.cloneDeep(this.s3params);
    params.Body = JSON.stringify(json);
    return this.s3.putObject(params, callback);
  }

  generateLocalRoutes() {
    _.forEach(this.routesConfig, (item) => {
      const conf = item.config;

      if (!conf) {
        return;
      }

      if (conf.auth && conf.auth.scope.length === 1 && _.first(conf.auth.scope) === 'admin') {
        return;
      }

      if (!conf.id) {
        throw new Error(`Id not found for ${item.path}`);
      }

      if (this.routes[conf.id]) {
        throw new Error(`Url with id '${conf.id}' exists`);
      }

      const route = {
        href: this.serviceApiRoot + item.path
      };

      if (item.title) {
        route.title = item.title;
      }

      this.localRoutes[conf.id] = route;
    });
  }

  injectApiRoot() {
    this.routesConfig.splice(0, 0, {method: 'GET', path: '/', handler: (request, reply) => {
      return reply({
        links: {self: this.serviceApiRoot},
        resources: _.chain(this.localRoutes).map((value, key) => {
          const route = {id: key};
          return _.merge({}, route, value);
        }).compact().value()
      });
    }});
  }

  url(id, args, params) {
    args = args || {};
    params = params || {};

    const routeTemplate = this.routes[id] ? this.routes[id].href : null;
    if (!routeTemplate) {
      throw new Error(`Url with id '${id}' not found`);
    }

    let results;
    let endpoint = routeTemplate;
    const regexp = /\{(\w+)\}/g;

    while ((results = regexp.exec(routeTemplate)) !== null) {
        const argName = results[1];
        const replaceStr = args[argName];

        if (!replaceStr) {
          const errMsg = `Argument ${argName} not found in ${routeTemplate}. Possible arguments ${JSON.stringify(args)}`;
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
