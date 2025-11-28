const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TechnicianSchema = new Schema({
  // ========== CATEGORY ==========
  category: { 
    type: String, 
    enum: ['IT & Networking'], 
    default: 'IT & Networking'
  },

  // ========== SUB-SERVICES ==========
  subServices: [{
    type: String,
    enum: [
      // Internet Services
      'Internet Installation',
      'Network Expansion',
      'Network Support',

      // CCTV
      'CCTV Installation',
      'CCTV Maintenance',

      // Computer Services
      'Software Installation & Repair',
      'Hardware Repair',
      'Virus Removal',
      'Data Recovery',

      // Alarm System Installation
      'Alarm System Installation',
      'Alarm Maintenance',

      // POS
      'POS Installation & Support',
      'POS Maintenance',

      // Phone Repair
      'Phone Repair',
      'Screen Replacement',
      'Battery Replacement',

      // TV Repair
      'TV Repair',
      'Display Calibration'
    ]
  }],

  // ========== LOCATION ==========
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String
  },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] } // [lng, lat]
  },

  // ========== RATINGS ==========
  rating: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0 },
    reviews: [{
      clientId: { type: Schema.Types.ObjectId, ref: 'User' }, // FIX: should reference Client/User
      rating: { type: Number, min: 1, max: 5 },
      comment: String,
      createdAt: { type: Date, default: Date.now }
    }]
  },

  // ========== CLIENT-SPECIFIC ==========
  // (If you merge technician + client schema later, this can stay here)
  savedTechnicians: [{ type: Schema.Types.ObjectId, ref: 'Technician' }],
  preferredCategories: [String]

}, { timestamps: true });

// Index for fast searches
TechnicianSchema.index({ category: 1, subServices: 1 });

// Geospatial index for location queries
TechnicianSchema.index({ location: "2dsphere" });

module.exports = mongoose.model('Technician', TechnicianSchema);
