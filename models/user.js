const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    organizationName: {
      type: String,
      required: true
    },
    users: {
      type: String,
      required: true
    },
  },
  { timestamps: true }
);

const users = mongoose.model('users', userSchema);

module.exports = users;