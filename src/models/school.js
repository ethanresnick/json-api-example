'use strict';
var mongoose   = require('mongoose');

module.exports = function(Organization, OrganizationSchema) {
  //School extends Organization,
  //adding the following properties
  var schema = new OrganizationSchema({
    isCollege: Boolean
  });

  return Organization.discriminator('School', schema);
};
