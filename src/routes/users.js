const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Executive = require('../models/Executive');
const Admin = require('../models/Admin');
const Superadmin = require('../models/Superadmin');
const { default: mongoose } = require('mongoose');
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
    res.json({ token, userType: user.userType ,phoneNumber:user.phoneNumber,name:user.name,id:user.id});
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
      !joiningDate 
      
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

//   const { id } = req.params;
//   const updateData = req.body; // The data to update

//   try {
//     // Validate the ObjectId
//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({ message: 'Invalid Executive ID' });
//     }

//     const updatedExecutive = await Executive.findByIdAndUpdate(id, updateData, {
//       new: true, // Return the updated document
//       runValidators: true, // Validate before updating
//     });

//     if (!updatedExecutive) {
//       return res.status(404).json({ message: 'Executive not found' });
//     }

//     res.json(updatedExecutive);
//   } catch (error) {
//     console.error('Error updating executive:', error);
//     res.status(500).json({ message: 'Internal Server Error' });
//   }
// });
// Admin registration route
router.post('/register-admin', async (req, res) => {
  const { id, name, username, password, phoneNumber, joiningDate, endDate, status } = req.body;

  console.log(req.body); // Debug line

  try {
    if (!id || !name || !username || !password || !phoneNumber || !joiningDate) {
      return res.status(400).json({ message: 'All required fields must be filled.' });
    }

    const existingAdmin = await Admin.findOne({ username });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Username already in use.' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = new Admin({
      id, // Accepting the ID from the frontend
      name,
      username,
      password: hashedPassword, // Directly saving the password as per your request
      phoneNumber,
      joiningDate,
      endDate, // Optional
      status: status || 'Working', // Default to 'Working' if not provided
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
  const updateData = req.body;

  // Log the incoming data for debugging
  console.log('Update request for executive:', { id, updateData });

  try {
    // Validate the id format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid Executive ID' });
    }

    // Attempt to update the executive
    const executive = await Executive.findByIdAndUpdate(id, updateData, {
      new: true, // Return the updated document
      runValidators: true, // Ensure validators are run
    });

    if (!executive) {
      return res.status(404).json({ message: 'Executive not found' });
    }

    // Send the updated executive as a response
    res.json(executive);
  } catch (error) {
    // Log the error for better debugging
    console.error('Error updating executive:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.delete('/executives/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Check if the ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid Executive ID format' });
    }

    // Find and delete the executive by ID
    const deletedExecutive = await Executive.findByIdAndDelete(id);

    if (!deletedExecutive) {
      return res.status(404).json({ message: 'Executive not found' });
    }

    res.status(200).json({ message: 'Executive deleted successfully' });
  } catch (error) {
    console.error('Error deleting executive:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});
module.exports = router;
