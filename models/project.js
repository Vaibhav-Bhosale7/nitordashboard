const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    organizationName: {
      type: String,
      required: true
    },
    projects: {
      type: String,
      required: true
    },
  },
  { timestamps: true }
);

const project = mongoose.model('project', projectSchema);

module.exports = project;