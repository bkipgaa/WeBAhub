const { User,Category } = require('../models/users');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const registerUser = async (req, res) => {
  const { 
    username, 
    password, 
    email, 
    phoneNumber,
    userType,
    category,
    services, // Array of selected services
    address
  } = req.body;

  try {
    // Validate required fields
    if (!username || !password || !email || !phoneNumber || !userType) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Validate category and services for technicians
    if (userType === 'technician') {
      if (!category) {
        return res.status(400).json({ message: 'Category is required for technicians' });
      }
      if (!services || services.length === 0) {
        return res.status(400).json({ message: 'At least one service is required for technicians' });
      }

      // Validate that services belong to the selected category
      const categoryData = await Category.findOne({ name: category });
      if (!categoryData) {
        return res.status(400).json({ message: 'Invalid category selected' });
      }

      const availableServices = categoryData.services.map(service => service.name);
      const invalidServices = services.filter(service => !availableServices.includes(service));
      
      if (invalidServices.length > 0) {
        return res.status(400).json({ 
          message: `Invalid services for category ${category}: ${invalidServices.join(', ')}` 
        });
      }
    }

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ username }, { email }, { phoneNumber }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with these credentials' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user object
    const userData = {
      username,
      password: hashedPassword,
      email,
      phoneNumber,
      userType,
      address,
      isAvailable: userType === 'technician'
    };

    // Add category and services if technician
    if (userType === 'technician') {
      userData.category = category;
      userData.services = services;
      
      // Auto-populate sub-services based on selected services
      const categoryData = await Category.findOne({ name: category });
      const allSubServices = [];
      
      services.forEach(serviceName => {
        const service = categoryData.services.find(s => s.name === serviceName);
        if (service) {
          allSubServices.push(...service.subServices);
        }
      });
      
      userData.subServices = allSubServices; // Auto-populated for search functionality
      userData.rating = { average: 0, count: 0 };
    } else {
      // Default client fields
      userData.savedTechnicians = [];
      userData.preferredCategories = [];
    }

    // Create and save new user
    const newUser = new User(userData);
    await newUser.save();

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: newUser._id, 
        userType: newUser.userType,
        username: newUser.username
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );

    // Return user data without password
    const userResponse = newUser.toObject();
    delete userResponse.password;

    res.status(201).json({ 
      message: 'User registered successfully', 
      token,
      user: userResponse
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      message: 'Error registering user', 
      error: error.message 
    });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email and populate role
    const user = await User.findOne({ email })
      
      .select('+password'); // Explicitly include password for comparison

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Update last active timestamp
    user.lastActive = new Date();
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user._id,
        userType: user.userType,
        email: user.email, // Include email in JWT payload if needed
        username: user.username,
        
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const responseData = {
      username: user.username,
      email: user.email,
      userType: user.userType,
    
      id: user._id  // Often useful to include the ID
    };

    res.json({
      message: 'Login successful',
      token,
      user: responseData
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      message: 'Error logging in', 
      error: error.message 
    });
  }
};

// Add new controller to get categories
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true });
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ 
      message: 'Error fetching categories', 
      error: error.message 
    });
  }
};


// Additional auth functions could be added here:
// - Password reset
// - Email verification
// - Profile update
// - Account deletion

module.exports = { 
  registerUser, 
  loginUser,
  getCategories
};