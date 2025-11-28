const jwt = require('jsonwebtoken');
const User = require('../models/users'); // Import the User model

// Middleware to authenticate users based on a JWT
const authenticate = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  console.log('Extracted token:', token);

  if (!token) {
    return res.status(401).json({ message: 'Access Denied: No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({ message: 'Access Denied: User not found' });
    }

    req.user = {
      id: user._id,
      username: user.username,
      userType: user.userType, // Use userType instead of role
    };

    console.log(`User authenticated: ${user.username} with userType: ${user.userType}`);
    next();
  } catch (error) {
    console.error('Token verification error:', error.message);
    
    // Handle specific error cases
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token format' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token has expired' });
    }
    
    res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = authenticate;