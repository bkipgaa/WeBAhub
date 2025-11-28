const express = require('express');
const router = express.Router();
const { 
  findTechniciansByService,
  getTechnicianCountsByDistance
} = require('../controllers/technicianlocation');

// These will now be available at /api/technicians/service and /api/technicians/counts
router.get('/service', findTechniciansByService);


module.exports = router;