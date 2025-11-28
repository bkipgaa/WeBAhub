const { User } = require('../models/users');
const fs = require('fs');
const path = require('path');

exports.updateProfile = async (req, res) => {
  try {
    const {
      username,
      professions,
      address,
      email,
      phoneNumber,
      projectRateCategory,
      about,
      portfolio,
      introVideo,
      education,
      certifications,
      skills
    } = req.body;

    // Validate professions if provided
    if (professions && !Array.isArray(professions)) {
      return res.status(400).json({ message: 'Professions must be an array' });
    }

    // Validate project rate category if provided
    const validCategories = [
      'under_10000',
      '10000_to_100000',
      '100000_to_1000000',
      'over_1000000'
    ];
    if (projectRateCategory && !validCategories.includes(projectRateCategory)) {
      return res.status(400).json({ message: 'Invalid project rate category' });
    }

    // Validate education array if provided
    if (education && Array.isArray(education)) {
      for (let edu of education) {
        if (edu.educationType && !['degree', 'diploma', 'certificate'].includes(edu.educationType)) {
          return res.status(400).json({ message: 'Invalid education type. Must be degree, diploma, or certificate' });
        }
        
        // Validate institution is provided
        if (!edu.institution || edu.institution.trim() === '') {
          return res.status(400).json({ message: 'Institution name is required' });
        }
        
        // Validate graduation year if provided
        if (edu.graduationYear) {
          const currentYear = new Date().getFullYear();
          if (edu.graduationYear < 1950 || edu.graduationYear > currentYear + 5) {
            return res.status(400).json({ message: 'Invalid graduation year' });
          }
        }
      }
    }

    // Validate skills array if provided
    if (skills && Array.isArray(skills)) {
      for (let skill of skills) {
        // Validate skill name
        if (!skill.name || skill.name.trim() === '') {
          return res.status(400).json({ message: 'Skill name is required' });
        }
        
        // Validate skill level
        if (skill.level && !['beginner', 'intermediate', 'expert'].includes(skill.level)) {
          return res.status(400).json({ message: 'Invalid skill level. Must be beginner, intermediate, or expert' });
        }
        
        // Validate years of experience if provided
        if (skill.yearsOfExperience && (skill.yearsOfExperience < 0 || skill.yearsOfExperience > 50)) {
          return res.status(400).json({ message: 'Years of experience must be between 0 and 50' });
        }
      }
    }

    // Validate certifications array if provided
    if (certifications && Array.isArray(certifications)) {
      for (let cert of certifications) {
        if (!cert.name || cert.name.trim() === '') {
          return res.status(400).json({ message: 'Certification name is required' });
        }
        
        if (!cert.issuedBy || cert.issuedBy.trim() === '') {
          return res.status(400).json({ message: 'Certification issuer is required' });
        }
        
        if (cert.issueYear) {
          const currentYear = new Date().getFullYear();
          if (cert.issueYear < 1950 || cert.issueYear > currentYear) {
            return res.status(400).json({ message: 'Invalid certification year' });
          }
        }
      }
    }

    const user = await User.findOne({ _id: req.user.id });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields
    user.username = username || user.username;
    user.email = email || user.email;
    user.phoneNumber = phoneNumber || user.phoneNumber;
    user.professions = professions || user.professions;
    user.projectRateCategory = projectRateCategory || user.projectRateCategory;
    user.address = address || user.address;
    user.about = about || user.about;
    user.portfolio = portfolio || user.portfolio;
    user.introVideo = introVideo || user.introVideo;
    
    // Update arrays only if provided
    if (education !== undefined) user.education = education;
    if (certifications !== undefined) user.certifications = certifications;
    if (skills !== undefined) user.skills = skills;

    await user.save();
    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(400).json({ message: error.message });
  }
};