// Importing the mongoose library to define schemas and interact with the MongoDB database.
const mongoose = require('mongoose');

// Defining the schema for the StatusLog model.
const statusLogSchema = new mongoose.Schema({
  // The `ticket` field stores the ObjectId of the related ticket.
  // It references the `Ticket` model to establish a relationship between the status log and the ticket.
  ticket: { type: mongoose.Schema.Types.ObjectId, ref: 'Ticket', required: true },
  
  // The `status` field stores the current status of the ticket (e.g., "Open", "In Progress", "Closed").
  // It is required when creating a new status log.
  status: { type: String, required: true },
  
  // The `changedBy` field stores the ObjectId of the user who changed the status of the ticket.
  // It references the `User` model to track which user made the change.
  changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // The `changedAt` field records the date and time when the status was changed.
  // It defaults to the current date and time when the status log is created.
  changedAt: { type: Date, default: Date.now },
});

// Exporting the model for the `StatusLog` collection.
// This model can now be used to perform CRUD operations on the `StatusLog` collection in MongoDB.
module.exports = mongoose.model('StatusLog', statusLogSchema);
