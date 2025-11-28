// Middleware to authorize users based on their roles
const authorize = (allowedRoles) => (req, res, next) => {
    // Check if the user's role is included in the allowed roles
    if (!allowedRoles.includes(req.user.role)) {
      // If not authorized, respond with a 403 Forbidden status
      return res.status(403).json({ message: 'Access Forbidden' });
    }
    
    // If authorized, proceed to the next middleware or route handler
    next();
  };
  
  // Export the authorize middleware for use in other parts of the application
  module.exports = authorize;
  