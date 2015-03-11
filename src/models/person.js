'use strict';
var mongoose   = require('mongoose');

var schema = mongoose.Schema({    
  name: String,
  email: {type: String, lowercase: true},
  gender: String
});

module.exports = mongoose.model('Person', schema);