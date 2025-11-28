const express = require('express');
const {getProfile} = require('../myProfile/myProfile');
const {updateProfile} = require('../myProfile/updateProfile');
const {updateProfilePicture} = require('../myProfile/updateProfilePicture');
const {addPortfolioProject, removePortfolioProject} = require('../myProfile/addPortfolio');
const {addSkill, removeSkill} = require('../myProfile/addSkill');
const {updateSkill} = require('../myProfile/updateSkill');
const {updateIntroVideo} = require('../myProfile/updateIntroVideo');
const {addCertification, removeCertification} = require('../myProfile/addCertification');
const {addEducation, removeEducation} = require('../myProfile/addEducation');
const auth = require('../middleware/authMiddleware');
const upload = require('../multerconfig');

const router = express.Router();



// Protected routes - require authentication
router.get('/me', auth, getProfile);
router.put('/update', auth, updateProfile);
router.put('/picture', auth, updateProfilePicture);
router.post('/portfolio', auth, addPortfolioProject);
router.delete('/portfolio/:projectId', auth, removePortfolioProject);
router.put('/intro-video', auth, updateIntroVideo);
router.post('/education', auth, addEducation);
router.delete('/education/:educationId', auth, removeEducation);
router.post('/certifications', auth, addCertification);
router.delete('/certifications/:certificationId', auth, removeCertification);
router.post('/skills', auth, addSkill);
router.put('/update', auth, updateSkill);
router.delete('/skills/:skillId', auth, removeSkill);
module.exports = router;