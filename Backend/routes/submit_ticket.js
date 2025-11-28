const express = require('express');
const router = express.Router();
const { submitTicketDetails } = require('../controllers/submitticket');



// Route to submit additional details for a specific ticket
router.put('/:ticketId/submitTicketDetails', submitTicketDetails);


module.exports = router;