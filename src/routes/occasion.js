const express = require('express');
const router = express.Router();
const Occasion = require('../models/Occasion'); // Assuming Occasion model is in models folder

// 1. Create Occasion (POST request)
router.post('/occasions', async (req, res) => {
  const { id, name } = req.body;

  try {
    // Check if id and name are provided
    if (!id || !name) {
      return res.status(400).json({ message: 'ID and Name are required.' });
    }

    // Check if the occasion with the same ID already exists
    const existingOccasion = await Occasion.findOne({ id });
    if (existingOccasion) {
      return res.status(400).json({ message: 'Occasion with this ID already exists.' });
    }

    // Create new occasion
    const newOccasion = new Occasion({ id, name });

    // Save to the database
    await newOccasion.save();

    return res.status(201).json({ message: 'Occasion created successfully.', occasion: newOccasion });
  } catch (error) {
    console.error('Error creating occasion:', error);
    return res.status(500).json({ message: 'Internal Server Error.' });
  }
});

// 2. Retrieve all Occasions (GET request)
router.get('/occasions', async (req, res) => {
  try {
    const occasions = await Occasion.find({});
    return res.status(200).json(occasions);
  } catch (error) {
    console.error('Error retrieving occasions:', error);
    return res.status(500).json({ message: 'Internal Server Error.' });
  }
});

// 3. Delete Occasion by ID (DELETE request)
router.delete('/occasions/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Find and delete the occasion by id
    const deletedOccasion = await Occasion.findOneAndDelete({ id });

    if (!deletedOccasion) {
      return res.status(404).json({ message: 'Occasion not found.' });
    }

    return res.status(200).json({ message: 'Occasion deleted successfully.' });
  } catch (error) {
    console.error('Error deleting occasion:', error);
    return res.status(500).json({ message: 'Internal Server Error.' });
  }
});
router.patch('/occasion/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body; // Fields to update

    // Find the occasion by ID and update it
    const updatedOccasion = await Occasion.findByIdAndUpdate(id, updateData, {
      new: true, // Return the updated document
      runValidators: true, // Run schema validation
    });

    if (!updatedOccasion) {
      return res.status(404).json({ error: 'Occasion not found' });
    }

    res.status(200).json({ message: 'Occasion updated successfully', occasion: updatedOccasion });
  } catch (error) {
    res.status(500).json({ error: 'Error updating occasion', details: error.message });
  }
});
module.exports = router;
