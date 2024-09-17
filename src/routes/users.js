const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// Register route
router.post('/register', async (req, res) => {
  const { username, password, userType } = req.body; // Added userType

  try {
    const user = await User.findOne({ username });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const newUser = new User({ username, password, userType }); // Save userType
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login route
router.post('/login', async (req, res) => {
  const { username, password, userType } = req.body; // Add userType to the request body

  try {
    // Find user by username
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if password is correct
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Ensure the user is logging in with the correct userType
    if (user.userType !== userType) {
      return res.status(403).json({ message: `Access denied for role: ${userType}` });
    }

    // Create token that includes both user ID and userType
    const token = jwt.sign(
      { id: user._id, userType: user.userType }, // Include userType in token
      'your_jwt_secret', // Secret key
      { expiresIn: '1h' } // Token expiration time
    );

    // Return the token and userType to the client
    res.json({ token, userType: user.userType });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
