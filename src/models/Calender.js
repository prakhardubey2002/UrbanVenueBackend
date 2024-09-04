
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
FarmSchema.index({ 'events.start': 1, 'events.end': 1 })
const PlaceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  farms: [FarmSchema],
})

const StateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  places: [PlaceSchema],
})
FarmSchema.index({ 'events.start': 1, 'events.end': 1 });
PlaceSchema.index({ 'farms.events.start': 1, 'farms.events.end': 1 });
StateSchema.index({ 'places.farms.events.start': 1, 'places.farms.events.end': 1 });
const Calender = mongoose.model('Calender', StateSchema)

module.exports = Calender
