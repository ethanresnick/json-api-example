'use strict';
var mongoose   = require('mongoose')
  , ObjectId   = mongoose.Schema.Types.ObjectId;

var schema = mongoose.Schema({
  name: String,
  email: {type: String, lowercase: true},
  parent: {ref:'Person', type: ObjectId},
  gender: {
    type: String,
    enum: ['male', 'female', 'other']
  }
});

module.exports = mongoose.model('Person', schema);
