// routes/state.js
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

// Get data by state and place name
// router.get('/:stateName/:placeName', async (req, res) => {
//   const { stateName, placeName } = req.params

//   try {
//     const state = await Calender.findOne({ name: stateName })
//     if (!state) {
//       return res.status(404).json({ message: 'State not found' })
//     }

//     const place = state.places.find((place) => place.name === placeName)
//     if (!place) {
//       return res.status(404).json({ message: 'Place not found' })
//     }

//     res.json(place)
//   } catch (error) {
//     res.status(500).json({ error: error.message })
//   }
// })

// Get data by state, place, and farm name
// router.get('/:stateName/:placeName/:farmName', async (req, res) => {
//   const { stateName, placeName, farmName } = req.params

//   try {
//     const state = await Calender.findOne({ name: stateName })
//     if (!state) {
//       return res.status(404).json({ message: 'State not found' })
//     }

//     const place = state.places.find((place) => place.name === placeName)
//     if (!place) {
//       return res.status(404).json({ message: 'Place not found' })
//     }

//     const farm = place.farms.find((farm) => farm.name === farmName)
//     if (!farm) {
//       return res.status(404).json({ message: 'Farm not found' })
//     }

//     res.json(farm)
//   } catch (error) {
//     res.status(500).json({ error: error.message })
//   }
// })

// Add or update data in a state
// router.post('/:stateName', async (req, res) => {
//   const { stateName } = req.params
//   const { places } = req.body

//   try {
//     let state = await Calender.findOne({ name: stateName })
//     if (!state) {
//       state = new Calender({ name: stateName, places })
//     } else {
//       state.places = places
//     }

//     await state.save()
//     res.status(200).json(state)
//   } catch (error) {
//     res.status(500).json({ error: error.message })
//   }
// })

// Add or update data in a specific place of a state
// router.post('/:stateName/:placeName', async (req, res) => {
//   const { stateName, placeName } = req.params
//   const { farms } = req.body

//   try {
//     let state = await Calender.findOne({ name: stateName })
//     if (!state) {
//       return res.status(404).json({ message: 'State not found' })
//     }

//     let place = state.places.find((place) => place.name === placeName)
//     if (!place) {
//       place = { name: placeName, farms }
//       state.places.push(place)
//     } else {
//       place.farms = farms
//     }

//     await state.save()
//     res.status(200).json(state)
//   } catch (error) {
//     res.status(500).json({ error: error.message })
//   }
// })

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
// Export the router
module.exports = router
