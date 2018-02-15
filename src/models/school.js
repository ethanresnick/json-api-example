'use strict';
var mongoose   = require('mongoose')
  , ObjectId   = mongoose.Schema.Types.ObjectId;

module.exports = function(Organization, OrganizationSchema) {
  //School extends Organization,
  //adding the following properties
  var schema = new OrganizationSchema({
    isCollege: Boolean,
    principal: { ref: 'Person', type: ObjectId }
  });

  return Organization.discriminator('School', schema);
};
