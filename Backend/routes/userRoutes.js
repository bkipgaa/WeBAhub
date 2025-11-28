const express = require('express');
const { registerUser, loginUser, getCategories } = require('../controllers/createuserscontroller');
const userController = require('../controllers/userprofile');
const auth = require('../middleware/authMiddleware');
const upload = require('../multerconfig');

const router = express.Router();

// ========== AUTHENTICATION ROUTES ==========
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/categories', getCategories);



// Public route - get user by ID
router.get('/profile/:id', userController.getUserById);


module.exports = router;