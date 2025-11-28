// routes/techniciansRoutes.js
const express = require('express');
const router = express.Router();
const { User } = require('../models/users'); // Correct import

// Get technicians by sub-service and category
router.get("/technicians_subservice", async (req, res) => {
  try {
    const { subService, category } = req.query;

    if (!subService) {
      return res.status(400).json({ 
        message: "Sub-service parameter is required" 
      });
    }

    // Find exact matches for the sub-service
    const exactMatches = await User.find({
      userType: 'technician',
      subServices: subService,
      ...(category && { category: category }) // Optional category filter
    }).select('username email profilePicture profession rating services subServices about address location');

    // Find related services (technicians who have similar services)
    let relatedServices = [];
    if (exactMatches.length === 0) {
      // If no exact matches, find technicians with similar services in the same category
      relatedServices = await User.find({
        userType: 'technician',
        category: category || { $exists: true },
        services: { $in: [subService] } // Look for similar service names
      }).select('username email profilePicture profession rating services subServices about address location');
    }

    res.json({
      exactMatches,
      relatedServices,
      count: exactMatches.length + relatedServices.length
    });

  } catch (error) {
    console.error("Error fetching technicians:", error);
    res.status(500).json({ 
      message: "Error fetching technicians", 
      error: error.message 
    });
  }
});

// Get technicians by service name
router.get("/technicians/service/:serviceName", async (req, res) => {
  try {
    const { serviceName } = req.params;

    const technicians = await User.find({
      userType: 'technician',
      services: serviceName
    }).select('username email profilePicture profession rating services subServices about address location');

    res.json({
      technicians,
      count: technicians.length
    });

  } catch (error) {
    console.error("Error fetching technicians by service:", error);
    res.status(500).json({ 
      message: "Error fetching technicians", 
      error: error.message 
    });
  }
});

// Get all technicians with filtering options
router.get("/technicians", async (req, res) => {
  try {
    const { category, service, subService } = req.query;
    
    let filter = { userType: 'technician' };
    
    if (category) filter.category = category;
    if (service) filter.services = service;
    if (subService) filter.subServices = subService;

    const technicians = await User.find(filter)
      .select('username email profilePicture profession rating services subServices about address location category');

    res.json({
      technicians,
      count: technicians.length
    });

  } catch (error) {
    console.error("Error fetching technicians:", error);
    res.status(500).json({ 
      message: "Error fetching technicians", 
      error: error.message 
    });
  }
});

module.exports = router;