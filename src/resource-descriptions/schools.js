module.exports = {
  parentType: "organizations",
  urlTemplates: {
    "self": "http://127.0.0.1:3000/schools/{id}"
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
      "isCollege": {
        "description": "Whether the school is a college, by the U.S. meaning."
      }
    }
  }
}
