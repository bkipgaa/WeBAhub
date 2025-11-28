// models/ticket.js
const mongoose = require('mongoose');

const TicketSchema = new mongoose.Schema({
  ticketType: {
    type: String,
    enum: ['installation', 'support'], // Enum for ticket type
    required: true,
  },
  clientName: {
    type: String,
    required: function() {
      return this.ticketType === 'installation'; // Only required for installation
    },
  },
  mobileNumber: {
    type: String,
    required: function() {
      return this.ticketType === 'installation'; // Only required for installation
    },
  },
  installationType: {
    type: String,
    enum: ['wireless', 'fibre'],
    required: function() {
      return this.ticketType === 'installation'; // Only required for installation ref: 'User', // Assuming you have a User model
    },
  }, assignedTechnician: { 
    id: { type: mongoose.Schema.Types.ObjectId, required: true }, // Store technician's ObjectId
    
    username: { type: String, required: true } // Store technician's username
  },
  createdBy: { 
    id: { type: mongoose.Schema.Types.ObjectId, required: true }, // Store creator's ObjectId
    username: { type: String, required: true } // Store creator's username
  },
 
  pppoeCredentials: {
    username: {
      type: String,
      required: function() {
        return this.ticketType === 'installation'; // Only required for installation
      },
    },
    password: {
      type: String,
      required: function() {
        return this.ticketType === 'installation'; // Only required for installation
      },
    },
  },
  location: {
    type: String,
    required: true,
  },
  createdAt: { type: Date, default: Date.now },



  status: { type: String, enum: ['Seen', 'Leaving for Site', 'Enroute', 'Arrived on Site', 'Submit Details', 'Complete'], default: 'Seen' },
  speedtestScreenshot: { type: String }, // URL to uploaded image
  wanPhoto: { type: String }, // URL to uploaded image
  lanPhoto: { type: String }, // URL to uploaded image
  macAddress: { type: String },
  signalReceived: { type: String },
  bomUsed: { type: String },
  additionalNotes: { type: String },
  
});

const Ticket = mongoose.model('Ticket', TicketSchema);
module.exports = Ticket;