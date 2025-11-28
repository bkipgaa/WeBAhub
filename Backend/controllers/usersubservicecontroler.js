const User = require('../models/users');
const fs = require('fs');
const path = require('path');

// Get technicians by subService and category
exports.getTechniciansByService = async (req, res) => {
  try {
    const { subService, category } = req.query;

    if (!subService || !category) {
      return res.status(400).json({ message: "subService and category are required" });
    }

    // Find exact match technicians
    const exactMatches = await User.find({
      userType: "technician",
      subServices: subService,
    }).select("-password -__v -savedTechnicians -preferredCategories");

    // Find related (same category, different subServices)
    const relatedServices = await User.find({
      userType: "technician",
      category,
      subServices: { $ne: subService }
    }).select("-password -__v -savedTechnicians -preferredCategories");

    res.json({ exactMatches, relatedServices });
  } catch (error) {
    console.error("Error fetching technicians by service:", error);
    res.status(500).json({ message: "Server error" });
  }
};
