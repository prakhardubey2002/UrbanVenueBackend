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
router.get('/all-farms', async (req, res) => {
  try {
    // Fetch all states with their places and farms
    const allStates = await Calender.find({}, {
      'places.farms.details': 1,
      'places.farms.address': 1,
      'places.farms.events': 1,
      'places.farms.farmId': 1, // Include farmId in the projection
      'places.name': 1,
      'name': 1
    });

    // Map the data to get farm details
    const farmDetails = allStates.flatMap(state => 
      state.places.flatMap(place =>
        place.farms.map(farm => ({
          state: state.name,
          place: place.name,
          farmId: farm.farmId, // Ensure farmId is included
          name: farm.details.name,
          phoneNumber: farm.details.phoneNumber,
          checkInDate: farm.details.checkInDate,
          checkInTime: farm.details.checkInTime,
          checkOutDate: farm.details.checkOutDate,
          checkOutTime: farm.details.checkOutTime,
          maxPeople: farm.details.maxPeople,
          occasion: farm.details.occasion,
          hostOwnerName: farm.details.hostOwnerName,
          hostNumber: farm.details.hostNumber,
          totalBooking: farm.details.totalBooking,
          advance: farm.details.advance,
          balancePayment: farm.details.balancePayment,
          securityAmount: farm.details.securityAmount,
          status: farm.details.status,
          address: farm.address,
          // events: farm.events // Include events if needed
        }))
      )
    );

    // If no farms are found, return a 404 response
    if (farmDetails.length === 0) {
      return res.status(404).json({ message: 'No farms found' });
    }

    // Send the farm details
    res.status(200).json(farmDetails);
  } catch (error) {
    console.error('Error fetching farm details:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.put('/update-farm/:farmId', async (req, res) => {
  try {
    const { farmId } = req.params;
    const {
      name,
      phoneNumber,
      address,
      checkInDate,
      checkInTime,
      checkOutDate,
      checkOutTime,
      maxPeople,
      occasion,
      hostOwnerName,
      hostNumber,
      totalBooking,
      advance,
      balancePayment,
      securityAmount,
      status,
      place,
      state
    } = req.body;

    // Ensure farm details are provided
    if (!farmId) {
      console.error('Farm ID is required');
      return res.status(400).json({ message: 'Farm ID is required' });
    }

    // Find and update the farm document
    const updatedFarm = await Calender.findOneAndUpdate(
      { 'places.farms.farmId': farmId },
      {
        $set: {
          'places.$[place].farms.$[farm].name': name,
          'places.$[place].farms.$[farm].phoneNumber': phoneNumber,
          'places.$[place].farms.$[farm].address': address,
          'places.$[place].farms.$[farm].checkInDate': checkInDate,
          'places.$[place].farms.$[farm].checkInTime': checkInTime,
          'places.$[place].farms.$[farm].checkOutDate': checkOutDate,
          'places.$[place].farms.$[farm].checkOutTime': checkOutTime,
          'places.$[place].farms.$[farm].maxPeople': maxPeople,
          'places.$[place].farms.$[farm].occasion': occasion,
          'places.$[place].farms.$[farm].hostOwnerName': hostOwnerName,
          'places.$[place].farms.$[farm].hostNumber': hostNumber,
          'places.$[place].farms.$[farm].totalBooking': totalBooking,
          'places.$[place].farms.$[farm].advance': advance,
          'places.$[place].farms.$[farm].balancePayment': balancePayment,
          'places.$[place].farms.$[farm].securityAmount': securityAmount,
          'places.$[place].farms.$[farm].status': status,
          'places.$[place].state': state, // Assuming you want to update the place and state at the place level
          'places.$[place].name': place
        }
      },
      {
        arrayFilters: [
          { 'place.name': place },
          { 'farm.farmId': farmId }
        ],
        new: true, // Return the updated document
        runValidators: true // Validate the update against the schema
      }
    );

    if (!updatedFarm) {
      console.error(`Farm with ID ${farmId} not found`);
      return res.status(404).json({ message: 'Farm not found' });
    }

    // Find and return the updated farm details
    const updatedPlace = updatedFarm.places.find(place =>
      place.farms.some(farm => farm.farmId === farmId)
    );
    const updatedFarmDetails = updatedPlace.farms.find(farm => farm.farmId === farmId);

    res.status(200).json({ message: 'Farm updated successfully', farm: updatedFarmDetails });
  } catch (error) {
    console.error('Error updating farm details:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
router.get('/farms-free-by-date-range', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Validate date range
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
      return res.status(400).json({ message: 'Invalid date range provided' });
    }

    // Find all states, places, and farms with their events
    const allFarms = await Calender.find({}, {
      "places.farms.name": 1,
      "places.name": 1,
      "name": 1,
      "places.farms.events": 1,
      "places.farms.details": 1 // Include details to access the farm name
    });

    // Filter the farms based on availability in the given date range
    const farmsWithAvailableDates = allFarms.map(state => {
      return {
        name: state.name,
        places: state.places.map(place => {
          return {
            name: place.name, // The name of the place
            farms: place.farms.filter(farm => {
              // Check if the farm has no overlapping events within the date range
              const isAvailable = !farm.events.some(event => {
                const eventStart = new Date(event.start);
                const eventEnd = new Date(event.end);
                // Event overlaps with the given date range if:
                return (eventStart <= end && eventEnd >= start);
              });

              return isAvailable;
            }).map(farm => ({
              name: farm.details.name, // Access the name from details
              farmId: farm.farmId,
              address: farm.address,
              events: farm.events,
            }))
          };
        }).filter(place => place.farms.length > 0) // Include only places with available farms
      };
    }).filter(state => state.places.length > 0); // Include only states with places having available farms

    // If no farms are available, return a 404 response
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
  const { stateName, placeName } = req.params;

  try {
    // Find the state by its name and select only the places field
    const state = await Calender.findOne({ name: stateName }).select('places');
    if (!state) {
      return res.status(404).json({ message: 'State not found' });
    }

    // Find the place within the state
    const place = state.places.find(place => place.name === placeName);
    if (!place) {
      return res.status(404).json({ message: 'Place not found' });
    }

    // Map over the farms and extract the names from the details field
    const farmNames = place.farms.map(farm => farm.details.name);
    res.json(farmNames);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get events by state, place, and farm (property)
router.get('/:stateName/:placeName/:farmName/events', async (req, res) => {
  const { stateName, placeName, farmName } = req.params;

  try {
    // Find the state by its name
    const state = await Calender.findOne({ name: stateName });
    if (!state) {
      return res.status(404).json({ message: 'State not found' });
    }

    // Find the place within the state
    const place = state.places.find(place => place.name === placeName);
    if (!place) {
      return res.status(404).json({ message: 'Place not found' });
    }

    // Find the farm within the place by matching the name in the details field
    const farm = place.farms.find(farm => farm.details.name === farmName);
    if (!farm) {
      return res.status(404).json({ message: 'Farm not found' });
    }

    // Return the events for the found farm
    res.json(farm.events || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Get farms with available events on a specific date
router.get('/:stateName/:placeName/farms/:date', async (req, res) => {
  const { stateName, placeName, date } = req.params;

  try {
    const selectedDate = new Date(date);
    if (isNaN(selectedDate.getTime())) {
      return res.status(400).json({ message: 'Invalid date format' });
    }

    // Normalize date to ensure comparisons are consistent
    const normalizeDate = (date) => new Date(date.toISOString().split('T')[0]);

    const state = await Calender.findOne({ name: stateName });
    if (!state) {
      return res.status(404).json({ message: 'State not found' });
    }

    const place = state.places.find((place) => place.name === placeName);
    if (!place) {
      return res.status(404).json({ message: 'Place not found' });
    }

    // Filter farms with no events on the selected date
    const farmsWithNoEvents = place.farms.filter((farm) => {
      return !farm.events.some((event) => {
        const eventStartDate = normalizeDate(new Date(event.start));
        const eventEndDate = normalizeDate(new Date(event.end));
        const comparisonDate = normalizeDate(selectedDate);

        // Check if the selected date falls within the event range
        return comparisonDate >= eventStartDate && comparisonDate <= eventEndDate;
      });
    });

    // Format result to include farm name from details and its events
    const result = farmsWithNoEvents.map((farm) => ({
      name: farm.details.name, // Access farm name from 'details.name'
      events: farm.events, // Include events if needed
    }));

    res.json(result);
  } catch (error) {
    console.error('Error fetching farms:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


router.get('/:state/:place/:property/address', async (req, res) => {
  try {
    const { state, place, property } = req.params;
    console.log(`Received request for state: ${state}, place: ${place}, property: ${property}`);

    // Find the state with the specified place and farm
    const stateData = await Calender.findOne(
      { 
        name: state, 
        'places.name': place, 
        'places.farms.details.name': property 
      },
      { 'places.$': 1 } // Select only the matched place
    );

    // Check if the state and place exist
    if (!stateData || stateData.places.length === 0) {
      return res.status(404).json({ message: 'State or place not found' });
    }

    // Find the farm within the matched place by its details.name
    const farm = stateData.places[0].farms.find(
      (farm) => farm.details.name === property
    );

    // Check if the farm exists
    if (!farm) {
      return res.status(404).json({ message: 'Farm not found' });
    }

    // Return the address of the farm
    res.json(farm.address);
  } catch (error) {
    console.error('Error retrieving farm address:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

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
      { name: stateName, 'places.farms.details.name': farmName },
      { 'places.$': 1 }
    );

    if (!stateData || stateData.places.length === 0) {
      return res.status(404).json({ message: 'State or farm not found' });
    }

    // Find the specific farm within the place
    const farm = stateData.places[0].farms.find(farm => farm.details.name === farmName);

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

router.post('/add-farm', async (req, res) => {
  try {
    const { stateName, placeName, farmDetails } = req.body;

    // Validate request body
    if (!stateName || !placeName || !farmDetails) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const {
      farmId, // Include farmId in the details
      name,
      address,
      phoneNumber,
      checkInDate,
      checkInTime,
      checkOutDate,
      checkOutTime,
      maxPeople,
      occasion,
      hostOwnerName,
      hostNumber,
      totalBooking,
      advance,
      balancePayment,
      securityAmount,
      status
    } = farmDetails;

    if (!farmId || !name || !address) {
      return res.status(400).json({ message: 'Farm ID, name, and address are required' });
    }

    // Generate a random date in the year 1980
    const getRandomDateIn1980 = () => {
      const start = new Date(1980, 0, 1); // January 1, 1980
      const end = new Date(1980, 11, 31); // December 31, 1980
      return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    };

    const randomEventDate = getRandomDateIn1980();

    // Create an initializer event with the random date
    const initialEvent = {
      title: 'Farm Opening Event',
      start: randomEventDate.toISOString(),
      end: new Date(randomEventDate.getTime() + 2 * 60 * 60 * 1000).toISOString(), // 2-hour event
    };

    // Find the state by name
    let state = await Calender.findOne({ name: stateName });

    const newFarm = {
      farmId, // Include farmId
      address, // Keep the address separately
      details: {
        name,
        phoneNumber,
        checkInDate,
        checkInTime,
        checkOutDate,
        checkOutTime,
        maxPeople,
        occasion,
        hostOwnerName,
        hostNumber,
        totalBooking,
        advance,
        balancePayment,
        securityAmount,
        status,
      },
      events: [initialEvent], // Add the initializer event
    };

    if (!state) {
      // If the state doesn't exist, create a new state with the place and farm
      const newPlace = {
        name: placeName,
        farms: [newFarm] // Add the farm to the place
      };

      state = new Calender({
        name: stateName,
        places: [newPlace] // Add the place with the farm to the state
      });

      await state.save();

      return res.status(201).json({ message: 'State, place, and farm added successfully with initial event', farm: newFarm });
    }

    // If state exists, check if the place exists
    let place = state.places.find(p => p.name === placeName);

    if (!place) {
      // If the place doesn't exist, create it and add the farm
      place = { name: placeName, farms: [newFarm] };
      state.places.push(place); // Add the place with the farm

      state.markModified('places');
      await state.save();

      return res.status(201).json({ message: 'Place and farm added successfully with initial event', farm: newFarm });
    }

    // Check if the farm already exists in the place
    const farmExists = place.farms.find(f => f.farmId === farmId);

    if (farmExists) {
      return res.status(400).json({ message: 'Farm with this ID already exists in this place' });
    }

    // If the place exists, just add the farm
    place.farms.push(newFarm); // Add the farm to the existing place

    state.markModified('places'); // Mark the places array as modified

    // Save the updated state
    await state.save();

    res.status(201).json({ message: 'Farm added successfully with initial event', farm: newFarm });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error });
  }
});


module.exports = router
