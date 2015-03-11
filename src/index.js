'use strict';
var express = require('express')
  , API     = require('json-api')
  , mongoose = require('mongoose');

// Start by loading up all our mongoose models and connecting.
mongoose.connect('mongodb://localhost/local');
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
var adapter = new API.adapters.Mongoose(models, null)
  , registry = new API.ResourceTypeRegistry()
  , Base = new API.controllers.Base(registry)
  , Docs = new API.controllers.Documentation(registry, {name: 'Example API'});

["people", "organizations", "schools"].forEach(function(resourceType) {
  var description = require('./resource-descriptions/' + resourceType);
  description.adapter = adapter;
  registry.type(resourceType, description);
})

// Now, add the routes.
// To do this in a more scalable and configurable way, check out
// http://github.com/ethanresnick/express-simple-router. To protect some
// routes, check out http://github.com/ethanresnick/express-simple-firewall.
var app = express();
app.use(express.static(__dirname + '/public'));

app.get("/", Docs.index.bind(Docs));
app.get("/:type(organizations|schools|people)", Base.GET.bind(Base));
app.get("/:type(organizations|schools|people)/:id", Base.GET.bind(Base));
app.post("/:type(organizations|schools|people)", Base.POST.bind(Base));
app.put("/:type(organizations|schools|people)/:id", Base.PUT.bind(Base));
app.delete("/:type(organizations|schools|people)/:id", Base.DELETE.bind(Base));
app.use(function(req, res, next) {
  Base.sendResources(req, res, API.types.ErrorResource.fromError({
    'message': 'Not Found',
    'status': 404
  }));
});

// And we're done! Start 'er up!
console.log('Starting up! Visit 127.0.0.1:3000 to see the docs.');
app.listen(3000);