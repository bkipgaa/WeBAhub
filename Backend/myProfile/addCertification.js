
const { User } = require('../models/users');
const fs = require('fs');
const path = require('path');
/**
 * Add certification
 */
exports.addCertification = async (req, res) => {
  try {
    const { name, issuedBy, issueYear, expirationYear, credentialId, credentialUrl } = req.body;
    
    if (!name || !issuedBy || !issueYear) {
      return res.status(400).json({ message: 'Name, issued by, and issue year are required' });
    }

    const user = await User.findOne({ _id: req.user.id });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const newCertification = {
      name,
      issuedBy,
      issueYear,
      expirationYear,
      credentialId: credentialId || '',
      credentialUrl: credentialUrl || ''
    };

    user.certifications = user.certifications || [];
    user.certifications.push(newCertification);
    await user.save();

    res.json({ message: 'Certification added successfully', certifications: user.certifications });
  } catch (error) {
    console.error('Error adding certification:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Remove certification
 */
exports.removeCertification = async (req, res) => {
  try {
    const { certificationId } = req.params;

    const user = await User.findOne({ _id: req.user.id });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.certifications = user.certifications.filter(cert => cert._id.toString() !== certificationId);
    await user.save();

    res.json({ message: 'Certification removed successfully', certifications: user.certifications });
  } catch (error) {
    console.error('Error removing certification:', error);
    res.status(500).json({ message: 'Server error' });
  }
};