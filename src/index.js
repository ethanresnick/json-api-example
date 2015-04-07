'use strict';
var path     = require('path')
  , express  = require('express')
  , API      = require('json-api')
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
var adapter = new API.adapters.Mongoose(models)
  , registry = new API.ResourceTypeRegistry()
  , Controller = new API.controllers.API(registry);

["people", "organizations", "schools"].forEach(function(resourceType) {
  var description = require('./resource-descriptions/' + resourceType);
  description.adapter = adapter;
  registry.type(resourceType, description);
})

// Initialize the automatic documentation.
// Note: don't do this til after you've registered all your resources.
var templatePath = path.resolve(__dirname, './public/views/style-docs.jade')
var Docs = new API.controllers.Documentation(registry, {name: 'Example API'}, templatePath);

// Initialize the express app + front controller.
var app = express();
app.use(express.static(__dirname + '/public'));

var Front = new API.controllers.Front(Controller, Docs);
var apiReqHandler = Front.apiRequest.bind(Front);

// Now, add the routes.
// To do this in a more scalable and configurable way, check out
// http://github.com/ethanresnick/express-simple-router. To protect some
// routes, check out http://github.com/ethanresnick/express-simple-firewall.
app.get("/", Front.docsRequest.bind(Front));
app.route("/:type(people|organizations|schools)")
  .get(apiReqHandler).post(apiReqHandler).patch(apiReqHandler);
app.route("/:type(people|organizations|schools)/:id")
  .get(apiReqHandler).patch(apiReqHandler).delete(apiReqHandler);
app.route("/:type(people|organizations|schools)/:id/links/:relationship")
  .get(apiReqHandler).post(apiReqHandler).patch(apiReqHandler);

app.use(function(req, res, next) {
  Front.sendError({'message': 'Not Found', 'status': 404}, req, res);
});

// And we're done! Start 'er up!
console.log('Starting up! Visit 127.0.0.1:3000 to see the docs.');
app.listen(3000);
