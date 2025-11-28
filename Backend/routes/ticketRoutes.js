const express = require('express');

const { createTicket } = require('../controllers/createticketcontroller');
const { getAllTickets } = require('../controllers/createticketcontroller');
const { getTechnicianTickets } = require('../controllers/createticketcontroller');
const { updateTicketStatus } = require('../controllers/createticketcontroller');
const { fetchClosedTickets } = require('../controllers/createticketcontroller');
const {  closeTicket} = require('../controllers/createticketcontroller');
const { getTicketById } = require('../controllers/createticketcontroller'); // Import getTicketById function
const router = express.Router();


router.post('/create', createTicket);
router.get('/getalltickets', getAllTickets);
router.get('/fetchClosedTickets', fetchClosedTickets);
// Route to fetch tickets assigned to a specific technician
router.get('/technician/:username', getTechnicianTickets);


// Route to get a ticket by its ID
router.get('/:ticketId', getTicketById); // This is the new route for fetching a ticket by ID
// Route to update the status of a specific ticket
router.put('/:ticketId/status', updateTicketStatus);


// Route to close a specific ticket
router.put('/:ticketId/close', closeTicket);


module.exports = router;
