const mongoose = require('mongoose');

// Define the Request schema for MongoDB
const RequestSchema = new mongoose.Schema({
  // The item being requested, must be a string and is required
  item: { type: String, required: true },

  // The quantity of the requested item, must be a number and is required
  quantity: { type: Number, required: true },

  // The status of the request; can be 'pending', 'approved', or 'rejected'.
  // Default value is 'pending'
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'], 
    default: 'pending' 
  },

  // Reference to the user who made the request; must be an ObjectId that refers to the User model
  requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  // Reference to the user who approved the request; must be an ObjectId that refers to the User model
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

// Export the Request model based on the defined schema
module.exports = mongoose.model('Request', RequestSchema);
