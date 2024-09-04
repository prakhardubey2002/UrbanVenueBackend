// routes/Calender.js
const express = require('express')
const Calender = require('../models/Calender') // Ensure correct path
const router = express.Router()

// 1. Specific Route: Get all state names
router.get('/states', async (req, res) => {
  try {
    const states = await Calender.find().select('name -_id')
    const stateNames = states.map((state) => state.name)
    res.json(stateNames)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// 2. General Route: Get all data
router.get('/', async (req, res) => {
  try {
    const data = await Calender.find()
    res.json(data)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// 3. Parameterized Routes: Order them after specific routes
// Get data by state name
router.get('/:stateName', async (req, res) => {
  const { stateName } = req.params

  try {
    const state = await Calender.findOne({ name: stateName })
    if (!state) {
      return res.status(404).json({ message: 'State not found' })
    }
    res.json(state)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get all place names by state name
router.get('/:stateName/places', async (req, res) => {
  const { stateName } = req.params

  try {
    const state = await Calender.findOne({ name: stateName }).select(
      'places.name -_id'
    )
    if (!state) {
      return res.status(404).json({ message: 'State not found' })
    }
    const placeNames = state.places.map((place) => place.name)
    res.json(placeNames)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get all farm names by state and place name
router.get('/:stateName/:placeName/farms', async (req, res) => {
  const { stateName, placeName } = req.params

  try {
    const state = await Calender.findOne({ name: stateName }).select('places')
    if (!state) {
      return res.status(404).json({ message: 'State not found' })
    }

    const place = state.places.find((place) => place.name === placeName)
    if (!place) {
      return res.status(404).json({ message: 'Place not found' })
    }

    const farmNames = place.farms.map((farm) => farm.name)
    res.json(farmNames)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get events by state, place, and farm (property)
router.get('/:stateName/:placeName/:farmName/events', async (req, res) => {
  const { stateName, placeName, farmName } = req.params

  try {
    const state = await Calender.findOne({ name: stateName })
    if (!state) {
      return res.status(404).json({ message: 'State not found' })
    }

    const place = state.places.find((place) => place.name === placeName)
    if (!place) {
      return res.status(404).json({ message: 'Place not found' })
    }

    const farm = place.farms.find((farm) => farm.name === farmName)
    if (!farm) {
      return res.status(404).json({ message: 'Farm not found' })
    }

    res.json(farm.events || []) // Assuming `farm.events` contains the list of events
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get farms with available events on a specific date
router.get('/:stateName/:placeName/farms/:date', async (req, res) => {
  const { stateName, placeName, date } = req.params;

  try {
    const selectedDate = new Date(date);
    if (isNaN(selectedDate.getTime())) {
      return res.status(400).json({ message: 'Invalid date format' });
    }

    // Helper function to strip time and only compare dates
    const getDateOnly = (date) => new Date(date.toISOString().split('T')[0]);

    const state = await Calender.findOne({ name: stateName });
    if (!state) {
      return res.status(404).json({ message: 'State not found' });
    }

    const place = state.places.find((place) => place.name === placeName);
    if (!place) {
      return res.status(404).json({ message: 'Place not found' });
    }

    // Filter farms to include only those that have no events on the specified date
    const farmsWithNoEvents = place.farms.filter((farm) => {
      // Check if there are no events on the selected date
      return !farm.events.some((event) => {
        const eventStartDate = getDateOnly(new Date(event.start));
        const eventEndDate = getDateOnly(new Date(event.end));
        const comparisonDate = getDateOnly(selectedDate);

        return comparisonDate >= eventStartDate && comparisonDate <= eventEndDate;
      });
    });

    // Map the farms to include their name and all events
    const result = farmsWithNoEvents.map((farm) => ({
      name: farm.name,
      events: farm.events, // Include all events
    }));

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});







// Export the router
module.exports = router
