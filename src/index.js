'use strict';
var path     = require('path')
  , express  = require('express')
  , API      = require('json-api')
  , APIError = API.types.Error
  , mongoose = require('mongoose')
  , virtualQueryFactory = require('./virtual-query-factory');

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
var adapter = new API.dbAdapters.Mongoose(models);
var registry = new API.ResourceTypeRegistry({
  people: require('./resource-descriptions/people'),
  organizations: require('./resource-descriptions/organizations'),
  schools: require('./resource-descriptions/schools')
}, { dbAdapter: adapter });

var Controller = new API.controllers.API(registry);

// Initialize the automatic documentation.
var Docs = new API.controllers.Documentation(registry, {name: 'Example API'});

// tell the lib the host name your API is served from; needed for security.
var opts = { host: 'example.com' };

// Initialize the express app + front controller.
var app = express();
var Front = new API.httpStrategies.Express(Controller, Docs, opts);
var apiReqHandler = Front.apiRequest;

// Enable CORS. Note: if you copy this code into production, you may want to
// disable this. See https://en.wikipedia.org/wiki/Cross-origin_resource_sharing
app.use(function(req, res, next) {
  res.set('Access-Control-Allow-Origin', '*');
  next();
})

// Now, add the routes.
// To demo some advanced functionality, we start with a route below that
// constructs a customized query.

// 1. This route demonstrates adding a where clause to the library-generated query.
// query.andWhere returns a new query that'll be used in place of the original.
app.get('/:type(schools)/colleges', Front.customAPIRequest({
  queryFactory: async (opts) => {
    const origQuery = await opts.makeQuery(opts);
    return origQuery.andWhere({ field: "isCollege", operator: "eq", value: true });
  }
}));

// 2. Likewise, at this route, we stick some extra computed data in meta if the
// ?addNameList param is present. This shows how to get access to req in your
// query transform fn and modify the response document. Note, you can
// call `.resultsIn` with a second argument too to format query errors.
// See https://github.com/ethanresnick/json-api/blob/c394e2c2cdeae63acf3c6660516891a2cf56affb/test/app/src/index.ts#L51
app.get('/:type(people)',
  Front.transformedAPIRequest((req, query) => {
    if(!('addNameList' in req.query)) {
      return query;
    }

    const origReturning = query.returning;
    return query.resultsIn(async (...args) => {
      const origResult = await origReturning(...args);
      const names = origResult.document.primary.map(it => it.attrs.name).values;
      origResult.document.meta = { ...origResult.document.meta, names };
      return origResult;
    })
  })
);

// Add generic/untransformed routes.
// These routes don't need any special treatment, and cover most of our endpoints.
// To do this in a more scalable and configurable way, check out
// http://github.com/ethanresnick/express-simple-router. To protect some
// routes, check out http://github.com/ethanresnick/express-simple-firewall.
app.get("/", Front.docsRequest);
app.route("/:type(people|organizations|schools)")
  .get(apiReqHandler).post(apiReqHandler).patch(apiReqHandler);
app.route("/:type(people|organizations|schools)/:id")
  .get(apiReqHandler).patch(apiReqHandler).delete(apiReqHandler);
app.route("/:type(people|organizations|schools)/:id/relationships/:relationship")
  .get(apiReqHandler).post(apiReqHandler).patch(apiReqHandler).delete(apiReqHandler);


// This last route below shows how to augment the auto-generated query for the
// GET /virtual-demo/people endpoint to support an ?include=principalOf parameter
// that populates a "virtual" principalOf relationship. (It reads the contents
// from School.principal; the relationship doesn't actually exist on Person model.)
//
// Note: you can use the exact same query factory for /people/:id route.
// Note 2: Users won't be able to add to this virtual relationship with a PATCH
// on the person or a POST to /people/:id/relationships/principalOf, because
// the relationship is virtual. However, you could write query factories to
// support those cases too. This will all be handled automatically, though,
// once the built-in Mongoose adapter supports "virtual populate" fields.
app.get('/virtual-demo/:type(people)', Front.customAPIRequest({
  queryFactory: virtualQueryFactory
}));

app.use(function(req, res, next) {
  Front.sendError(new APIError(404, undefined, 'Not Found'), req, res);
});

// And we're done! Start 'er up!
console.log('Starting up! Visit 127.0.0.1:3000 to see the docs.');
app.listen(3000);
