// backend/models/Role.js

const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,  // Ensure role names are unique
  },
  permissions: {
    type: [String],  // Array of strings for permissions
    required: true,
  },
});

const Role = mongoose.model('Role', roleSchema);

module.exports = Role;
