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
          farmId: farm.details.farmId, // Ensure farmId is included
          name: farm.details.name,
          phoneNumber: farm.details.phoneNumber,
          checkInTime: farm.details.checkInTime,
          checkOutDate: farm.details.checkOutDate,
          checkOutTime: farm.details.checkOutTime,
          numberOfAdults: farm.details.numberOfAdults, // Updated
          numberOfKids: farm.details.numberOfKids,     // Updated
          occasion: farm.details.occasion,
          advanceCollectedBy:farm.details.advanceCollectedBy,
          pendingCollectedBy:farm.details.pendingCollectedBy,
          advanceMode:farm.details.advanceMode,
          email:farm.details.email,
          otherServices:farm.details.otherServices,
          urbanvenuecommission:farm.details.urbanvenuecommission,
          termsConditions:farm.details.termsConditions,
          eventAddOns:farm.details.eventAddOns,
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


router.patch('/update-farm/:state/:place/:farmId', async (req, res) => {
  try {
    const { state, place, farmId } = req.params;
    console.log(`Received parameters: state=${state}, place=${place}, farmId=${farmId}`);

    const updateFields = {};

    // Update address if provided
    if (req.body.address) {
      updateFields['farms.$.address'] = {
        addressLine1: req.body.address.addressLine1 || '',
        addressLine2: req.body.address.addressLine2 || '',
        country: req.body.address.country || '',
        state: req.body.address.state || '',
        suburb: req.body.address.suburb || '',
        zipCode: req.body.address.zipCode || ''
      };
    }

    // Initialize the details object only if fields in details are provided
    const detailsUpdate = {};
    if (req.body.advance !== undefined) detailsUpdate['farms.$.details.advance'] = req.body.advance;
    if (req.body.advanceCollectedBy) detailsUpdate['farms.$.details.advanceCollectedBy'] = req.body.advanceCollectedBy;
    if (req.body.advanceMode) detailsUpdate['farms.$.details.advanceMode'] = req.body.advanceMode;
    if (req.body.balancePayment !== undefined) detailsUpdate['farms.$.details.balancePayment'] = req.body.balancePayment;
    if (req.body.checkInTime) detailsUpdate['farms.$.details.checkInTime'] = req.body.checkInTime;
    if (req.body.checkOutDate) detailsUpdate['farms.$.details.checkOutDate'] = req.body.checkOutDate;
    if (req.body.checkOutTime) detailsUpdate['farms.$.details.checkOutTime'] = req.body.checkOutTime;
    if (req.body.email) detailsUpdate['farms.$.details.email'] = req.body.email;
    if (req.body.eventAddOns) detailsUpdate['farms.$.details.eventAddOns'] = req.body.eventAddOns;
    if (req.body.hostNumber) detailsUpdate['farms.$.details.hostNumber'] = req.body.hostNumber;
    if (req.body.hostOwnerName) detailsUpdate['farms.$.details.hostOwnerName'] = req.body.hostOwnerName;
    if (req.body.name) detailsUpdate['farms.$.details.name'] = req.body.name;
    if (req.body.numberOfAdults !== undefined) detailsUpdate['farms.$.details.numberOfAdults'] = req.body.numberOfAdults;
    if (req.body.numberOfKids !== undefined) detailsUpdate['farms.$.details.numberOfKids'] = req.body.numberOfKids;
    if (req.body.occasion) detailsUpdate['farms.$.details.occasion'] = req.body.occasion;
    if (req.body.otherServices !== undefined) detailsUpdate['farms.$.details.otherServices'] = req.body.otherServices;
    if (req.body.pendingCollectedBy) detailsUpdate['farms.$.details.pendingCollectedBy'] = req.body.pendingCollectedBy;
    if (req.body.phoneNumber) detailsUpdate['farms.$.details.phoneNumber'] = req.body.phoneNumber;
    if (req.body.securityAmount !== undefined) detailsUpdate['farms.$.details.securityAmount'] = req.body.securityAmount;
    if (req.body.status) detailsUpdate['farms.$.details.status'] = req.body.status;
    if (req.body.termsConditions) detailsUpdate['farms.$.details.termsConditions'] = req.body.termsConditions;
    if (req.body.totalBooking !== undefined) detailsUpdate['farms.$.details.totalBooking'] = req.body.totalBooking;
    if (req.body.urbanvenuecommission !== undefined) detailsUpdate['farms.$.details.urbanvenuecommission'] = req.body.urbanvenuecommission;

    // Combine updates
    Object.assign(updateFields, detailsUpdate);

    console.log('Update fields:', JSON.stringify(updateFields));

    // Find the farm and update it
    const updatedFarm = await Calender.findOneAndUpdate(
      { 'state': state, 'place': place, 'farms.details.farmId': farmId },
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    console.log('Updated farm:', JSON.stringify(updatedFarm));

    if (!updatedFarm) {
      return res.status(404).json({ message: 'Farm not found' });
    }

    // Return the updated farm details
    const updatedPlace = updatedFarm.places.find(place =>
      place.farms.some(farm => farm.details.farmId === farmId)
    );
    const updatedFarmDetails = updatedPlace.farms.find(farm => farm.details.farmId === farmId);

    res.status(200).json({ message: 'Farm updated successfully', farm: updatedFarmDetails });
  } catch (error) {
    console.error('Error updating farm details:', error.message);
    res.status(500).json({ message: 'Internal server error', error: error.message });
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
router.get('/:state/:property/details', async (req, res) => {
  try {
    const { state, property } = req.params;
    console.log(`Received request for state: ${state}, property: ${property}`);

    // Find the state with the specified property (farm name)
    const stateData = await Calender.findOne(
      { 
        name: state, 
        'places.farms.details.name': property 
      },
      { 'places.$': 1 } // Select only the places where farms match the property
    );

    // Check if the state and property (farm) exist
    if (!stateData || stateData.places.length === 0) {
      return res.status(404).json({ message: 'State or property not found' });
    }

    // Find the place(s) containing the farm with the specific details.name
    let foundFarm = null;

    // Iterate over places to find the farm with the matching property name
    stateData.places.forEach(place => {
      const farm = place.farms.find(farm => farm.details.name === property);
      if (farm) {
        foundFarm = farm;
      }
    });

    // If no matching farm is found
    if (!foundFarm) {
      return res.status(404).json({ message: 'Property (farm) not found' });
    }

    // Return the found farm object
    res.json(foundFarm);
  } catch (error) {
    console.error('Error retrieving farm details:', error);
    res.status(500).json({ message: 'Server error' });
  }
});



router.get('/:state/:place/:property/details', async (req, res) => {
  try {
    const { state, place, property } = req.params;
    console.log(`Received request for state: ${state}, place: ${place}, property: ${property}`);

    // Find the state with the specified place and property (farm name)
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
    const placeData = stateData.places[0];
    const farm = placeData.farms.find(farm => farm.details.name === property);

    // Check if the farm exists
    if (!farm) {
      return res.status(404).json({ message: 'Farm not found' });
    }

    // Return the entire farm object, including all its details and address
    res.json(farm);
  } catch (error) {
    console.error('Error retrieving farm details:', error);
    res.status(500).json({ message: 'Server error' });
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
    // if (!stateName || !placeName || !farmDetails) {
    //   return res.status(400).json({ message: 'Missing required fields' });
    // }
    if (!stateName) {
      console.error('Missing field: stateName');
      return res.status(400).json({ message: 'Missing required field: stateName' });
    }

    if (!placeName) {
      console.error('Missing field: placeName');
      return res.status(400).json({ message: 'Missing required field: placeName' });
    }

    if (!farmDetails) {
      console.error('Missing field: farmDetails');
      return res.status(400).json({ message: 'Missing required field: farmDetails' });
    }

    const {
      farmId,
      name,
      address,
      phoneNumber,
      checkInTime,
      checkOutDate,
      checkOutTime,
      numberOfAdults, // Updated
      numberOfKids,   // Updated
      occasion,
      hostOwnerName,
      hostNumber,
      totalBooking,
      advance,
      balancePayment,
      securityAmount,
      advanceCollectedBy,
      pendingCollectedBy,
      advanceMode,
      email,
      otherServices,
      urbanvenuecommission,
      termsConditions,
      eventAddOns,
      status,
      farmTref, // Added farmTref
      maplink
    } = farmDetails;

    if (!farmId || !name || !address) {
      return res.status(400).json({ message: 'Farm ID, name, and address are required' });
    }

    // Generate a random date in the year 1980
    const getRandomDateIn1980 = () => {
      const start = new Date(1980, 0, 1);
      const end = new Date(1980, 11, 31);
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
      
      address,
      details: {
        name,
        farmId,
        phoneNumber,
        checkInTime,
        checkOutDate,
        checkOutTime,
        numberOfAdults, // Updated
        numberOfKids,   // Updated
        occasion,
        hostOwnerName,
        hostNumber,
        totalBooking,
        advance,
        balancePayment,
        securityAmount,
        advanceCollectedBy,
        pendingCollectedBy,
        advanceMode,
        email,
        otherServices,
        urbanvenuecommission,
        termsConditions,
        eventAddOns,
        status,
        maplink
      },
      farmTref, // Added farmTref
      events: [initialEvent],
    };

    if (!state) {
      // If the state doesn't exist, create a new state with the place and farm
      const newPlace = {
        name: placeName,
        farms: [newFarm], // Add the farm to the place
      };

      state = new Calender({
        name: stateName,
        places: [newPlace], // Add the place with the farm to the state
      });

      await state.save();

      return res.status(201).json({ message: 'State, place, and farm added successfully with initial event', farm: newFarm });
    }

    // If state exists, check if the place exists
    let place = state.places.find((p) => p.name === placeName);

    if (!place) {
      // If the place doesn't exist, create it and add the farm
      place = { name: placeName, farms: [newFarm] };
      state.places.push(place); // Add the place with the farm

      state.markModified('places');
      await state.save();

      return res.status(201).json({ message: 'Place and farm added successfully with initial event', farm: newFarm });
    }

    // Check if the farm already exists in the place
    const farmExists = place.farms.find((f) => f.farmId === farmId);

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

router.delete('/farms/:stateName/:placeName/:farmId', async (req, res) => {
  const { stateName, placeName, farmId } = req.params;

  try {
    // Find the calendar and remove the farm
    const updatedCalendar = await Calender.findOneAndUpdate(
      {
        name: stateName,
        'places.name': placeName,
      },
      {
        $pull: { 'places.$.farms': { 'details.farmId': farmId } },
      },
      { new: true }
    );

    if (!updatedCalendar) {
      return res.status(404).json({ error: 'Farm not found' });
    }

    return res.status(200).json({ message: 'Farm deleted successfully', updatedCalendar });
  } catch (error) {
    console.error('Error deleting farm:', error.message);
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router
