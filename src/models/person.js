'use strict';
var mongoose   = require('mongoose');

var schema = mongoose.Schema({
  name: String,
  email: {type: String, lowercase: true},
  gender: {
    type: String,
    enum: ['male', 'female', 'other']
  }
});

module.exports = mongoose.model('Person', schema);
