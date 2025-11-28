const { User } = require('../models/users');
const fs = require('fs');
const path = require('path');


/**
 * Add portfolio project
 */
exports.addPortfolioProject = async (req, res) => {
  try {
    const { title, description, projectUrl, technologies, projectDate } = req.body;
    
    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required' });
    }

    const user = await User.findOne({ _id: req.user.id });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const newProject = {
      title,
      description,
      projectUrl: projectUrl || '',
      technologies: technologies || [],
      projectDate: projectDate || new Date(),
      images: req.files ? req.files.map(file => `/uploads/portfolio/${file.filename}`) : []
    };

    user.portfolio = user.portfolio || [];
    user.portfolio.push(newProject);
    await user.save();

    res.json({ message: 'Portfolio project added successfully', portfolio: user.portfolio });
  } catch (error) {
    console.error('Error adding portfolio project:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


/**
 * Remove portfolio project
 */
exports.removePortfolioProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    const user = await User.findOne({ _id: req.user.id });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.portfolio = user.portfolio.filter(project => project._id.toString() !== projectId);
    await user.save();

    res.json({ message: 'Portfolio project removed successfully', portfolio: user.portfolio });
  } catch (error) {
    console.error('Error removing portfolio project:', error);
    res.status(500).json({ message: 'Server error' });
  }
};