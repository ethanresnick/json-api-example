'use strict';
var path     = require('path')
  , express  = require('express')
  , API      = require('json-api')
  , APIError = API.types.Error
  , Router   = require("express-simple-router")
  , mongoose = require('mongoose');

// Start by loading up all our mongoose models and connecting.
mongoose.connect('mongodb://localhost/example');
var OrganizationModelSchema = require('./models/organization')
  , OrganizationModel       = OrganizationModelSchema.model
  , OrganizationSchema      = OrganizationModelSchema.schema;

var models = {
  Person: require('./models/person'),
  Organization: OrganizationModel,
  School: require('./models/school')(OrganizationModel, OrganizationSchema)
}

// And registering them with the json-api library.
// Below, we load up every resource type and give each the same adapter; in
// theory, though, different types could be powered by different dbs/adapters.
// Check /resource-desciptions/school.js to see some of the advanced features.
var adapter = new API.dbAdapters.Mongoose(models)
  , registry = new API.ResourceTypeRegistry()
  , Controller = new API.controllers.API(registry);

["people", "organizations", "schools"].forEach(function(resourceType) {
  var description = require('./resource-descriptions/' + resourceType);
  description.dbAdapter = adapter;
  registry.type(resourceType, description);
})

// Initialize the automatic documentation.
// Note: don't do this til after you've registered all your resources.)
var Docs = new API.controllers.Documentation(registry, {name: 'Example API'});

// Initialize the express app + the front controller,
// which we'll call API for routing purposes.
var app = express();
var controllers = {
  'API': new API.httpStrategies.Express(Controller, Docs)
};

// Enable CORS. Note: if you copy this code into production, you may want to
// disable this. See https://en.wikipedia.org/wiki/Cross-origin_resource_sharing
app.use(function(req, res, next) {
  res.set('Access-Control-Allow-Origin', '*');
  next();
})

// Now, add the routes.
var routes = [
  { "path": "/", "handler": "API.docsRequest" },
  { "path": "/:type(people|organizations|schools)", "handler": "API.apiRequest", "method": "GET" },
  { "path": "/:type(people|organizations|schools)", "handler": "API.apiRequest", "method": "POST" },
  { "path": "/:type(people|organizations|schools)", "handler": "API.apiRequest", "method": "PATCH" }
];

app.use(Router(routes, "127.0.0.1").handle(controllers));

app.use(function(req, res, next) {
  controllers.API.sendError(new APIError(404, undefined, 'Not Found'), req, res);
});

// And we're done! Start 'er up!
console.log('Starting up! Visit 127.0.0.1:3000 to see the docs.');
app.listen(3000);
