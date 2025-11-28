const { User } = require('../models/users');
const fs = require('fs');
const path = require('path');

/**
 * Update skill
 */
exports.updateSkill = async (req, res) => {
  try {
    const { skillId } = req.params;
    const { name, level, yearsOfExperience } = req.body;

    if (!name || !level) {
      return res.status(400).json({ message: 'Skill name and level are required' });
    }

    if (!['beginner', 'intermediate', 'expert'].includes(level)) {
      return res.status(400).json({ message: 'Invalid skill level' });
    }

    const user = await User.findOne({ _id: req.user.id });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const skillIndex = user.skills.findIndex(skill => skill._id.toString() === skillId);
    if (skillIndex === -1) {
      return res.status(404).json({ message: 'Skill not found' });
    }

    // Check for duplicate skill name (excluding current skill)
    const duplicateSkill = user.skills.find(
      (skill, index) => 
        index !== skillIndex && 
        skill.name.toLowerCase() === name.toLowerCase()
    );

    if (duplicateSkill) {
      return res.status(400).json({ message: 'Skill name already exists' });
    }

    user.skills[skillIndex] = {
      ...user.skills[skillIndex].toObject(),
      name: name.trim(),
      level,
      yearsOfExperience: yearsOfExperience || 0
    };

    await user.save();
    res.json({ message: 'Skill updated successfully', skills: user.skills });
  } catch (error) {
    console.error('Error updating skill:', error);
    res.status(500).json({ message: 'Server error' });
  }
};