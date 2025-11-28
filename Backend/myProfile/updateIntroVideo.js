const { User } = require('../models/users');
const fs = require('fs');
const path = require('path');


/**
 * Update intro video
 */
exports.updateIntroVideo = async (req, res) => {
  try {
    const { videoUrl } = req.body;
    
    if (!videoUrl) {
      return res.status(400).json({ message: 'Video URL is required' });
    }

    const user = await User.findOne({ _id: req.user.id });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.introVideo = videoUrl;
    await user.save();

    res.json({ message: 'Intro video updated successfully', introVideo: user.introVideo });
  } catch (error) {
    console.error('Error updating intro video:', error);
    res.status(500).json({ message: 'Server error' });
  }
};