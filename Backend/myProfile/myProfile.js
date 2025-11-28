const { User } = require('../models/users');
const fs = require('fs');
const path = require('path');


/**
 * Get current user's profile (Authenticated - own profile)
 */
exports.getProfile = async (req, res) => {
  try {
    console.log('Getting profile for user ID:', req.user.id);
    
    const user = await User.findById(req.user.id)
      .select('-password -__v');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

