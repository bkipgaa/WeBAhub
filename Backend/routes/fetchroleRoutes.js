const express = require('express');
const Role = require('../models/roles');

const router = express.Router();

// GET /api/roles - Get all roles
router.get('/fetch', async (req, res) => {
  try {
    const roles = await Role.find({}, 'name'); // Only fetch role names
    res.json(roles);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching roles', error: error.message });
  }
});

module.exports = router;
