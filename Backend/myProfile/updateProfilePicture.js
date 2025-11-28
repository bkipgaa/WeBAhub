const { User } = require('../models/users');
const fs = require('fs');
const path = require('path');



/**
 * Update profile picture
 */
exports.updateProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const user = await User.findOne({ _id: req.user.id });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete old picture if exists
    if (user.profilePicture) {
      const oldPath = path.join(__dirname, '..', 'uploads', 'profile-pictures', path.basename(user.profilePicture));
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    // Save new picture path
    user.profilePicture = `/uploads/profile-pictures/${req.file.filename}`;
    await user.save();

    res.json({ 
      message: 'Profile picture updated successfully',
      profilePicture: user.profilePicture
    });
  } catch (error) {
    console.error('Error updating profile picture:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
