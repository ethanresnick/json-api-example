module.exports = async function queryFactory(opts) {
  // use the library's built-in logic, provided by the makeQuery function,
  // to generate a base query that will find all people
  const origQuery = await opts.makeQuery(opts);
  const origReturning = origQuery.returning;

  // Whether the user has asked to include the contents for our synthetic
  // principalOf relationship (which is backed by School.principal).
  const includingPrincipalOf =
    (opts.request.queryParams.include || []).includes('principalOf');

  // Remove the principalOf path from population, since passing that to the
  // adapter will cause an error, because Person model doesn't actually have
  // a principalOf relationship.
  const newQuery = includingPrincipalOf
    ? origQuery.withoutPopulates(['principalOf'])
    : origQuery;

  // Use `.resultsIn` to create a new query based on newQuery, but with a
  // different `.returning` function. (query.returning holds the function
  // responsible for formatting the db results from mongo.) In the new
  // returning function, query for the related schools and include them
  // when ?include=principalOf is in use.
  return newQuery.resultsIn(async (...args) => {
    const result = await origReturning(...args);
    const peopleById = result.document.primary.values.reduce((acc, it) => {
      acc[it.id] = it;
      return acc;
    }, {});

    const peopleIds = Object.keys(peopleById);
    if(includingPrincipalOf) {
      const schoolsQuery = new API.FindQuery({ type: "schools" }).andWhere({
        field: "principal",
        operator: "in",
        value: peopleIds
      });

      const schools =
        await adapter.find(schoolsQuery).then(([schools]) => schools.values);

      // Add schools to document.included
      result.document.included = (result.document.included || []).concat(schools);

      // Compute the list of schools that belong to each person.
      const peopleIdsToSchoolIds = schools.reduce((acc, school) => {
        const principalData = school.relationships.principal.values;
        const principalId = principalData[0] && principalData[0].id;
        if(principalId) {
          acc[principalId] = (acc[principalId] || []).concat(school.id);
        }
        return acc;
      }, {});

      // Augtment the principalOf relationship on each person with
      // the final school linkage.
      peopleIds.forEach((id) => {
        peopleById[id].relationships.principalOf = API.Relationship.of({
          data: peopleIdsToSchoolIds[id].map(id =>
            new API.ResourceIdentifier("organizations", id)
          ),
          links: peopleById[id].relationships.principalOf.links,
          owner: peopleById[id].relationships.principalOf.owner
        });
      });
    }

    return result;
  });
};
