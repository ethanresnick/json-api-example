module.exports = {
  urlTemplates: {
    "self": "http://127.0.0.1:3000/people/{id}",
    "relationship": "http://127.0.0.1:3000/people/{ownerId}/relationships/{path}"
  },

  /**
   * An optional function called on each resource provided by the client (i.e.
   * in a POST or PATCH request) before it's sent to the adapter for saving. You
   * can transform the data here as necessary or pre-emptively reject the
   * request.
   *
   * @param {Resource} resource - The resource to be transformed
   * @param {Object} req - The framework's request object
   * @param {Object} res - The framework's response object
   * @param {Function|undefined} superFn - The beforeSave function on the parent
   *   resource type, if any
   * @returns {Resource|undefined} - The transformed resource
   * @throws Can throw an error (APIError or Error) to abort the request
   */
  beforeSave: function(resource, req, res, superFn) {
    return resource;
  },

  /**
   * An optional function called on each resource after it's found by the
   * adapter but before it's sent to the client. This lets you do things like
   * hide fields that some users aren't authorized to see.
   *
   * @param {Resource} resource - The resource to be transformed
   * @param {Object} req - The framework's request object
   * @param {Object} res - The framework's response object
   * @param {Function|undefined} superFn - The beforeSave function on the parent
   *   resource type, if any
   * @returns {Resource|undefined} - The transformed resource or undefined to
   *   remove the resource from the response entirely
   */
  beforeRender: function(resource, req, res, superFn) {
    return resource;
  }
};
