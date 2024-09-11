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
  const { stateName, placeName, date } = req.params

  try {
    const selectedDate = new Date(date)
    if (isNaN(selectedDate.getTime())) {
      return res.status(400).json({ message: 'Invalid date format' })
    }

    // Helper function to strip time and only compare dates
    const getDateOnly = (date) => new Date(date.toISOString().split('T')[0])

    const state = await Calender.findOne({ name: stateName })
    if (!state) {
      return res.status(404).json({ message: 'State not found' })
    }

    const place = state.places.find((place) => place.name === placeName)
    if (!place) {
      return res.status(404).json({ message: 'Place not found' })
    }

    // Filter farms to include only those that have no events on the specified date
    const farmsWithNoEvents = place.farms.filter((farm) => {
      // Check if there are no events on the selected date
      return !farm.events.some((event) => {
        const eventStartDate = getDateOnly(new Date(event.start))
        const eventEndDate = getDateOnly(new Date(event.end))
        const comparisonDate = getDateOnly(selectedDate)

        return (
          comparisonDate >= eventStartDate && comparisonDate <= eventEndDate
        )
      })
    })

    // Map the farms to include their name and all events
    const result = farmsWithNoEvents.map((farm) => ({
      name: farm.name,
      events: farm.events, // Include all events
    }))

    res.json(result)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.get('/:state/:place/:property/address', async (req, res) => {
  try {
    const { state, place, property } = req.params
    console.log(`Received request for state: ${req.params.state}, place: ${req.params.place}, property: ${req.params.property}`);
    const stateData = await Calender.findOne(
      { name: state, 'places.name': place, 'places.farms.name': property },
      { 'places.$': 1 }
    )
    if (!stateData || stateData.places.length === 0)
      return res.status(404).json({ message: 'State or place not found' })

    const farm = stateData.places[0].farms.find(
      (farm) => farm.name === property
    )
    if (!farm) return res.status(404).json({ message: 'Farm not found' })

    res.json(farm.address)
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
})
router.post('/add-event', async (req, res) => {
  const { state, placeName, farmName, event } = req.body;

  try {
    // Validate input
    if (!state || !placeName || !farmName || !event || !event.title || !event.start || !event.end) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Convert start and end dates to Date objects
    const eventStartDate = new Date(event.start);
    const eventEndDate = new Date(event.end);

    if (isNaN(eventStartDate.getTime()) || isNaN(eventEndDate.getTime())) {
      return res.status(400).json({ error: 'Invalid date format' });
    }

    // Find the state, place, and farm
    const updatedCalender = await Calender.findOneAndUpdate(
      { 
        name: state,
        'places.name': placeName,
        'places.farms.name': farmName 
      },
      { 
        $push: { 'places.$.farms.$[farm].events': event } 
      },
      { 
        arrayFilters: [{ 'farm.name': farmName }], // Target the specific farm
        new: true // Return the updated document
      }
    );

    // If the state or farm is not found
    if (!updatedCalender) {
      return res.status(404).json({ error: 'State, place, or farm not found' });
    }

    res.status(200).json({
      message: 'Event added successfully',
      updatedCalender
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/update-event', async (req, res) => {
  const { state, placeName, farmName, eventId, updatedEvent } = req.body;

  try {
    // Validate input
    if (!state || !placeName || !farmName || !eventId || !updatedEvent) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Convert start and end dates to Date objects
    if (updatedEvent.start) {
      const eventStartDate = new Date(updatedEvent.start);
      if (isNaN(eventStartDate.getTime())) {
        return res.status(400).json({ error: 'Invalid start date format' });
      }
    }
    if (updatedEvent.end) {
      const eventEndDate = new Date(updatedEvent.end);
      if (isNaN(eventEndDate.getTime())) {
        return res.status(400).json({ error: 'Invalid end date format' });
      }
    }

    // Find the state, place, and farm
    const updatedCalender = await Calender.findOneAndUpdate(
      {
        name: state,
        'places.name': placeName,
        'places.farms.name': farmName,
        'places.farms.events._id': eventId // Find the event by its ID
      },
      {
        $set: {
          'places.$.farms.$[farm].events.$[event]': updatedEvent // Update the specific event
        }
      },
      {
        arrayFilters: [
          { 'farm.name': farmName },
          { 'event._id': eventId } // Target the specific event by its ID
        ],
        new: true // Return the updated document
      }
    );

    // If the state, place, farm, or event is not found
    if (!updatedCalender) {
      return res.status(404).json({ error: 'State, place, farm, or event not found' });
    }

    res.status(200).json({
      message: 'Event updated successfully',
      updatedCalender
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router
