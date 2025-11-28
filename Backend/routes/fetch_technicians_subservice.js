const express = require('express');
const { getTechniciansByService } = require('../controllers/usersubservicecontroler');

const router = express.Router();

// Get technicians by subService + category

router.get('/technicians_subservice', getTechniciansByService);

module.exports = router;
