# json-api-example
An example API created with v3 of my JSON-API library (http://github.com/ethanresnick/json-api).

# Try it out

1. Clone the repo
2. Run `npm install`
3. Ensure MongoDB is running and listening on the default port
4. Run `npm run start`
5. Try out the following (for example):
  - `GET http://localhost:3000/` to view the auto-generated documentation
  - `GET http://localhost:3000/people` to view the people collection
  - `GET http://localhost:3000/people?addNameList` as an example of modifying the library-generated response document (see extra info in `meta`) 
  - `GET http://localhost:3000/schools` to view all schools
  - `GET http://localhost:3000/schools/colleges` as an example of constructing a custom query for a request, to show only colleges
  - `POST http://localhost:3000/schools` to add a school
  - `GET http://localhost:3000/organizations` to view the organizations collection, which includes all schools too
  - `GET http://localhost:3000/people/{id}` to view a person, after it's been created
  - `GET`, `POST`, or `PATCH` `http://localhost:3000/organizations/{id}/relationships/liaisons` to view or modify an organization's `liaisons` relationship
