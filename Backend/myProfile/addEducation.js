const { User } = require('../models/users');
const fs = require('fs');
const path = require('path');

/**
 * Add education entry
 */
exports.addEducation = async (req, res) => {
  try {
    const { institution, educationType, fieldOfStudy, graduationYear, description } = req.body;
    
    if (!institution || !educationType || !fieldOfStudy) {
      return res.status(400).json({ message: 'Institution, education type, and field of study are required' });
    }

    if (!['degree', 'diploma', 'certificate'].includes(educationType)) {
      return res.status(400).json({ message: 'Invalid education type' });
    }

    const user = await User.findOne({ _id: req.user.id });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const newEducation = {
      institution,
      educationType,
      fieldOfStudy,
      graduationYear,
      description: description || ''
    };

    user.education = user.education || [];
    user.education.push(newEducation);
    await user.save();

    res.json({ message: 'Education added successfully', education: user.education });
  } catch (error) {
    console.error('Error adding education:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Remove education entry
 */
exports.removeEducation = async (req, res) => {
  try {
    const { educationId } = req.params;

    const user = await User.findOne({ _id: req.user.id });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.education = user.education.filter(edu => edu._id.toString() !== educationId);
    await user.save();

    res.json({ message: 'Education removed successfully', education: user.education });
  } catch (error) {
    console.error('Error removing education:', error);
    res.status(500).json({ message: 'Server error' });
  }
};