// models/Event.js
const mongoose = require('mongoose')

const EventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  start: { type: Date, required: true },
  end: { type: Date, required: true },
})

const FarmSchema = new mongoose.Schema({
  name: { type: String, required: true },
  events: [EventSchema],
})

const PlaceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  farms: [FarmSchema],
})

const StateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  places: [PlaceSchema],
})

const Calender = mongoose.model('Calender', StateSchema)

module.exports = Calender
