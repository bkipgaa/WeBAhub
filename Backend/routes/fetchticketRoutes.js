// routes/fetchticketRoutes.js
const express = require('express');
const router = express.Router();
const Ticket = require('../models/Tickets'); // Assuming the Ticket model is in the models folder
const authenticate = require('../middleware/auth'); // Import the authenticate middleware
const authorize = require('../middleware/authorize'); // Import the authorize middleware

// Route to get tickets assigned to a specific technician
router.get('/assigned', authenticate, authorize(['Technician']), async (req, res) => {
  try {
    // Find tickets assigned to the logged-in technician by their ObjectId
    const tickets = await Ticket.find({ 'assignedTechnician.id': req.user.id,
      status: { $ne:"Complete" } // Exclude completed tickets
     });
    res.status(200).json(tickets);
  } catch (error) {
    console.error('Error fetching assigned tickets:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});

module.exports = router;
