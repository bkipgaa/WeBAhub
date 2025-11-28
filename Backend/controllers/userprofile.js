const { User } = require('../models/users');
const fs = require('fs');
const path = require('path');

/**
 * Get user by ID (Public endpoint)
 */
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id })
      .select('-password -__v -savedTechnicians -preferredCategories');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('User data being sent:', {
      id: user._id,
      about: user.about,
      allFields: Object.keys(user.toObject())
    });
    
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Server error' });
  }
};



