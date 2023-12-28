const mongoose = require('mongoose');

const workItemsSchema = new mongoose.Schema(
  {
    organizationName: {
      type: String,
      required: true
    },
    projectId: {
      type: String,
      required: true
    },
    projectName: {
      type: String,
      required: true
    },
    workItems: {
      type: String,
      required: true
    },
  },
  { timestamps: true }
);

const workItems = mongoose.model('workItems', workItemsSchema);

module.exports = workItems;