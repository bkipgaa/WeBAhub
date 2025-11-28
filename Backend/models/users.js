const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Service Schema (nested within Category)
const serviceSchema = new Schema({
  name: { type: String, required: true },
  subServices: [{ type: String }]
});

// Define categories and their sub-services
const categorySchema = new Schema({
  name: { type: String, required: true, unique: true },
  services: [serviceSchema], // Array of services with their sub-service
  isActive: { type: Boolean, default: true } // Status flag to enable/disable category without deleting it
}, { timestamps: true });

// Portfolio Project Schema
const portfolioProjectSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  projectUrl: { type: String, default: '' },
  technologies: [{ type: String }],
  projectDate: { type: Date, default: Date.now },
  images: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
});

// Education Schema
const educationSchema = new Schema({
  institution: { type: String, required: true },
  educationType: { 
    type: String, 
    enum: ['degree', 'diploma', 'certificate'],
    required: true 
  },
  fieldOfStudy: { type: String, required: true },
  graduationYear: { type: Number },
  description: { type: String, default: '' }
});

// Certification Schema
const certificationSchema = new Schema({
  name: { type: String, required: true },
  issuedBy: { type: String, required: true },
  issueYear: { type: Number, required: true },
  expirationYear: { type: Number },
  credentialId: { type: String, default: '' },
  credentialUrl: { type: String, default: '' }
});

// Skill Schema
const skillSchema = new Schema({
  name: { type: String, required: true },
  level: { 
    type: String, 
    enum: ['beginner', 'intermediate', 'expert'],
    required: true 
  },
  yearsOfExperience: { type: Number, default: 0 }
});

const userSchema = new Schema({
 
  // ========== BASIC INFORMATION ==========
  profilePicture: { type: String, default: '' },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phoneNumber: { type: String, required: true },

  // ========== PROFESSIONAL INFORMATION ==========
  professions: [{ 
    type: String,
    enum: ['electrician','network technician','IT technician', 'CCTV Technician','Alarm Technician', 'POS Technician','Computer Technician', 'Phone Technician','software engineer' ,'plumber', 'carpenter', 'mechanic', 'painter', 'other']
  }],

  profession: { type: String }, // Technician's main profession

  projectRateCategory: {
    type: String,
    enum: [
      'under_10000',
      '10000_to_100000',
      '100000_to_1000000',
      'over_1000000'
    ]
  },

  // ========== ROLE AND TYPE ==========
  userType: { type: String, enum: ['client', 'technician'], required: true },

  // ========== VISIBILITY & ACTIVATION ==========
  visibilityTier: {
    type: String,
    enum: ['basic', 'premium', 'featured'],
    default: 'basic'
  },
  visibilityExpiry: {
    type: Date,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },

  // ========== CATEGORY AND SERVICES ==========
  category: { type: String },
  services: [{ type: String }], // Array of service names
  subServices: [{ type: String }], // Array of sub-service names

  // ========== PROFILE SECTIONS ==========
  
  // About Me Section
  about: { type: String, maxlength: 500, default: '' },
  
  // Portfolio Section
  portfolio: [portfolioProjectSchema],
  
  // Intro Video Section
  introVideo: { type: String, default: '' },
  
  // Education Section
  education: [educationSchema],
  
  // Certifications Section
  certifications: [certificationSchema],
  
  // Skills & Experience Section
  skills: [skillSchema],

  // ========== LOCATION ==========
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String
  },
  location: {
    type: { 
      type: String, 
      enum: ['Point'], 
      default: 'Point',
      required: true 
    },
    coordinates: { 
      type: [Number], 
      required: true,
      default: [0, 0],
      index: '2dsphere' // This enables geospatial queries
    }
  },

  // ========== RATINGS ==========
  rating: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0 },
    reviews: [{
      clientId: { type: Schema.Types.ObjectId, ref: 'User' },
      rating: { type: Number, min: 1, max: 5 },
      comment: String,
      createdAt: { type: Date, default: Date.now }
    }]
  },

  // ========== CLIENT-SPECIFIC ==========
  savedTechnicians: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  preferredCategories: [String]

}, { timestamps: true });

// Index for fast sub-service searches
userSchema.index({ category: 1, subServices: 1 });

// Geospatial index for location queries
userSchema.index({ location: "2dsphere" });

// Index for visibility and active status
userSchema.index({ visibilityTier: 1, visibilityExpiry: 1, isActive: 1 });

// Index for portfolio projects
userSchema.index({ 'portfolio.createdAt': -1 });

// Index for education search
userSchema.index({ 'education.institution': 1, 'education.educationType': 1 });

// Index for certifications search
userSchema.index({ 'certifications.name': 1, 'certifications.issuedBy': 1 });

// Index for skills search
userSchema.index({ 'skills.name': 1, 'skills.level': 1 });

const Category = mongoose.model('Category', categorySchema);
const User = mongoose.model('User', userSchema);

module.exports = { User, Category };