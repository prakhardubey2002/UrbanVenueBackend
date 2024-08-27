const mongoose = require('mongoose')

const EventSchema = new mongoose.Schema({
  title: String,
  start: Date,
  end: Date,
})

const PlaceSchema = new mongoose.Schema({
  name: String,
  farms: {
    type: Map,
    of: [EventSchema],
  },
})

const StateSchema = new mongoose.Schema({
  name: String,
  places: {
    type: Map,
    of: PlaceSchema,
  },
})

const EventModel = mongoose.model('Event', EventSchema)
const PlaceModel = mongoose.model('Place', PlaceSchema)
const StateModel = mongoose.model('State', StateSchema)

module.exports = { EventModel, PlaceModel, StateModel }
