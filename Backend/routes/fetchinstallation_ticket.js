// routes/ticket.js (or similar file)
const express = require('express');
const router = express.Router();

// Endpoint for dropdown options
router.get('/dropdown-options', (req, res) => {
  res.json({
    ticketTypes: ['installation', 'support'],
    installationTypes: ['wireless', 'fibre'],
  });
});

module.exports = router;
