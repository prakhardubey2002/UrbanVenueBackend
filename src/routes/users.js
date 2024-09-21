const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Executive = require('../models/Executive');
const Admin = require('../models/Admin');
const Superadmin = require('../models/Superadmin');
const router = express.Router();



router.get('/executives', async (req, res) => {
  try {
    const executives = await Executive.find({});
    res.json(executives);
  } catch (error) {
    console.error('Error retrieving executives:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});
// Login route

router.post('/login', async (req, res) => {
  const { username, password, userType } = req.body; // Add userType to the request body

  try {
    let user;

    // Search in the appropriate model based on userType
    if (userType === 'Executive') {
      user = await Executive.findOne({ userId: username }); // Search in Executive model
    } else if (userType === 'Admin') {
      user = await Admin.findOne({ username }); // Search in Admin model
    } else if (userType === 'SuperAdmin') {
      user = await Superadmin.findOne({ username }); // Search in Superadmin model
    }

    // If the user is not found, return an error
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if the password is correct
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Ensure the user is logging in with the correct userType
    if (user.userType !== userType) {
      return res
        .status(403)
        .json({ message: `Access denied for role: ${userType}` });
    }

    // Create a token that includes both user ID and userType
    const token = jwt.sign(
      { id: user._id, userType: user.userType }, // Include userType in the token
      'your_jwt_secret', // Secret key
      { expiresIn: '1h' } // Token expiration time
    );

    // Return the token and userType to the client
    res.json({ token, userType: user.userType });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Executive registration route
router.post('/register-executive', async (req, res) => {
  const {
    id,
    name,
    userId,
    password,
    phoneNumber,
    joiningDate,
    endDate,
    status,
  } = req.body;

  try {
    // Validate required fields
    if (
      !id ||
      !name ||
      !userId ||
      !password ||
      !phoneNumber ||
      !joiningDate ||
      !endDate
    ) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    // Check if an executive with the same userId already exists
    const existingExecutive = await Executive.findOne({ userId });
    if (existingExecutive) {
      return res.status(400).json({ message: 'User ID already in use.' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10); // Hashing with salt rounds = 10

    // Create a new executive
    const newExecutive = new Executive({
      id,
      name,
      userId,
      password: hashedPassword, // Store the hashed password
      phoneNumber,
      joiningDate,
      endDate,
      status: status || 'Working',
      userType: 'Executive' // Ensure userType is set correctly
    });

    // Save the executive to the database
    await newExecutive.save();

    return res.status(201).json({
      message: 'Executive registered successfully.',
      executive: newExecutive,
    });
  } catch (error) {
    console.error('Error registering executive:', error);
    return res.status(500).json({ message: 'Server error, please try again later.' });
  }
});

// Admin registration route
router.post('/register-admin', async (req, res) => {
  const { username, password } = req.body;

  console.log(req.body); // Debug line

  try {
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required.' });
    }

    const existingAdmin = await Admin.findOne({ username });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Username already in use.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = new Admin({
      username,
      password: hashedPassword,
      userType: 'Admin',
    });

    await newAdmin.save();

    return res.status(201).json({
      message: 'Admin registered successfully.',
      admin: newAdmin,
    });
  } catch (error) {
    console.error('Error registering admin:', error.message); // Enhanced error message
    return res.status(500).json({ message: 'Server error, please try again later.' });
  }
});


// SuperAdmin registration route
router.post('/register-superadmin', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Validate required fields
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required.' });
    }

    // Check if a superadmin with the same username already exists
    const existingSuperadmin = await Superadmin.findOne({ username });
    if (existingSuperadmin) {
      return res.status(400).json({ message: 'Username already in use.' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new superadmin
    const newSuperadmin = new Superadmin({
      username,
      password: hashedPassword,
      userType: 'SuperAdmin', // Explicitly set the userType
    });

    // Save the superadmin to the database
    await newSuperadmin.save();

    return res.status(201).json({
      message: 'SuperAdmin registered successfully.',
      superadmin: newSuperadmin,
    });
  } catch (error) {
    console.error('Error registering superadmin:', error);
    return res.status(500).json({ message: 'Server error, please try again later.' });
  }
});
router.patch('/executives/:id', async (req, res) => {
  const { id } = req.params;
  const updateData = req.body; // This should include fields to update

  try {
    const executive = await Executive.findByIdAndUpdate(id, updateData, {
      new: true, // Return the updated document
      runValidators: true, // Ensure validators are run
    });

    if (!executive) {
      return res.status(404).json({ message: 'Executive not found' });
    }

    res.json(executive);
  } catch (error) {
    console.error('Error updating executive:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});
module.exports = router;
