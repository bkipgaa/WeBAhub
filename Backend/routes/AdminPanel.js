const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/authorize');

// Admin panel route
router.get('/admin', authenticate, authorize(['Admin', 'Customer-Service', 'Storekeeper']), (req, res) => {
  res.json({ message: 'Welcome to the admin panel' });
});

module.exports = router;
