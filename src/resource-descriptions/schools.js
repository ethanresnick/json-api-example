module.exports = {
  parentType: "organizations",
  urlTemplates: {
    "schools": "http://127.0.0.1/schools/{schools.id}",
    'schools.liaisons': 'http://127.0.0.1/people/{schools.liaisons}'
  },

  labelToIdOrIds: function(label, model, req) {
    if(label =="colleges") {
      return model.findCollegeIds();
    }
    
    return label;
  },

  info: {
    "description": "A description of your School resource (optional).",
    "fields": {
      "isCollege": "Whether the school is a college, by the U.S. meaning."
    }
  }
}