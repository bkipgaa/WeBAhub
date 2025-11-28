const { User } = require('../models/users');
const fs = require('fs');
const path = require('path');




/**
 * Add skill (Custom skills - technician enters their own)
 */
exports.addSkill = async (req, res) => {
  try {
    const { name, level, yearsOfExperience } = req.body;
    
    if (!name || !level) {
      return res.status(400).json({ message: 'Skill name and level are required' });
    }

    if (!['beginner', 'intermediate', 'expert'].includes(level)) {
      return res.status(400).json({ message: 'Invalid skill level. Must be beginner, intermediate, or expert' });
    }

    const user = await User.findOne({ _id: req.user.id });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if skill already exists (case insensitive)
    const existingSkill = user.skills?.find(
      skill => skill.name.toLowerCase() === name.toLowerCase()
    );

    if (existingSkill) {
      return res.status(400).json({ message: 'Skill already exists' });
    }

    const newSkill = {
      name: name.trim(),
      level,
      yearsOfExperience: yearsOfExperience || 0
    };

    user.skills = user.skills || [];
    user.skills.push(newSkill);
    await user.save();

    res.json({ message: 'Skill added successfully', skills: user.skills });
  } catch (error) {
    console.error('Error adding skill:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


/**
 * Remove skill
 */
exports.removeSkill = async (req, res) => {
  try {
    const { skillId } = req.params;

    const user = await User.findOne({ _id: req.user.id });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.skills = user.skills.filter(skill => skill._id.toString() !== skillId);
    await user.save();

    res.json({ message: 'Skill removed successfully', skills: user.skills });
  } catch (error) {
    console.error('Error removing skill:', error);
    res.status(500).json({ message: 'Server error' });
  }
};