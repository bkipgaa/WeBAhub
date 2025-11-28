// routes/authStatus.js
const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const { User } = require('../models/users'); // Correct import

// Middleware to verify JWT
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

router.get('/status', authenticate, async (req, res) => {
  try {
    // Fixed: User.findOne (capital O) and use _id to find by ID
    const user = await User.findOne({ _id: req.userId }).select('username email userType');
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    res.json({
      success: true,
      username: user.username,
      email: user.email,
      userType: user.userType
    });

  } catch (error) {
    console.error('Auth status error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error fetching user data' 
    });
  }
});

module.exports = router;