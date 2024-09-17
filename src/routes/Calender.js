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
router.get('/farms-free-by-date-range', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Find all states and their places and farms
    const allFarms = await Calender.find({}, {
      "places.farms.name": 1,
      "places.name": 1,
      "name": 1,
      "places.farms.events": 1
    });

    // Filter the farms based on availability of start and end dates
    const farmsWithAvailableDates = allFarms.map(state => {
      return {
        name: state.name,
        places: state.places.map(place => {
          return {
            name: place.name,
            farms: place.farms.filter(farm => {
              // Check if there are no events on the startDate and endDate
              const isStartDateAvailable = !farm.events.some(event => {
                const eventStart = new Date(event.start);
                const eventEnd = new Date(event.end);
                return (eventStart <= start && eventEnd >= start); // Event overlaps with the startDate
              });

              const isEndDateAvailable = !farm.events.some(event => {
                const eventStart = new Date(event.start);
                const eventEnd = new Date(event.end);
                return (eventStart <= end && eventEnd >= end); // Event overlaps with the endDate
              });

              // Farm is available if both startDate and endDate are free
              return isStartDateAvailable && isEndDateAvailable;
            })
          };
        }).filter(place => place.farms.length > 0) // Only include places that have free farms
      };
    }).filter(state => state.places.length > 0); // Only include states that have places with free farms

    // If no farms are found, return a 404 response
    if (farmsWithAvailableDates.length === 0) {
      return res.status(404).json({ message: "No farms available in the selected date range." });
    }

    // Send the farms with available dates
    res.status(200).json(farmsWithAvailableDates);

  } catch (error) {
    console.error('Error fetching available farms:', error);
    res.status(500).json({ message: "Internal server error" });
  }
});



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

    res.json(farm.events || []) 
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

    const getDateOnly = (date) => new Date(date.toISOString().split('T')[0])

    const state = await Calender.findOne({ name: stateName })
    if (!state) {
      return res.status(404).json({ message: 'State not found' })
    }

    const place = state.places.find((place) => place.name === placeName)
    if (!place) {
      return res.status(404).json({ message: 'Place not found' })
    }

    
    const farmsWithNoEvents = place.farms.filter((farm) => {
     
      return !farm.events.some((event) => {
        const eventStartDate = getDateOnly(new Date(event.start))
        const eventEndDate = getDateOnly(new Date(event.end))
        const comparisonDate = getDateOnly(selectedDate)

        return (
          comparisonDate >= eventStartDate && comparisonDate <= eventEndDate
        )
      })
    })

    const result = farmsWithNoEvents.map((farm) => ({
      name: farm.name,
      events: farm.events, 
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
    
    if (!state || !placeName || !farmName || !event || !event.title || !event.start || !event.end) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

  
    const eventStartDate = new Date(event.start);
    const eventEndDate = new Date(event.end);

    if (isNaN(eventStartDate.getTime()) || isNaN(eventEndDate.getTime())) {
      return res.status(400).json({ error: 'Invalid date format' });
    }

    
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
        arrayFilters: [{ 'farm.name': farmName }],
        new: true 
      }
    );

    
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

    const updatedCalender = await Calender.findOneAndUpdate(
      {
        name: state,
        'places.name': placeName,
        'places.farms.name': farmName,
        'places.farms.events._id': eventId 
      },
      {
        $set: {
          'places.$.farms.$[farm].events.$[event]': updatedEvent 
        }
      },
      {
        arrayFilters: [
          { 'farm.name': farmName },
          { 'event._id': eventId } 
        ],
        new: true 
      }
    );

   
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

router.get('/:stateName/:farmName/address', async (req, res) => {
  const { stateName, farmName } = req.params;

  try {
   
    const stateData = await Calender.findOne(
      { name: stateName, 'places.farms.name': farmName },
      { 'places.$': 1 } 
    );

   
    if (!stateData || stateData.places.length === 0) {
      return res.status(404).json({ message: 'State or farm not found' });
    }

    // Find the specific farm within the place
    const farm = stateData.places[0].farms.find(farm => farm.name === farmName);

    // If the farm is not found
    if (!farm) {
      return res.status(404).json({ message: 'Farm not found' });
    }

    // Return the address of the farm
    res.json(farm.address);
  } catch (error) {
    console.error('Error fetching farm address:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router
