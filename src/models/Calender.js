const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const EventSchema = new mongoose.Schema({
  _id: { type: String, default: uuidv4 },
  title: { type: String, required: true },
  start: { type: Date, required: true },
  end: { type: Date, required: true },
});

const AddressSchema = new mongoose.Schema({
  addressLine1: { type: String, required: true },
  addressLine2: { type: String }, 
  country: { type: String, required: true },
  state: { type: String, required: true },
  suburb: { type: String }, 
  zipCode: { type: String, required: true }, 
});

const FarmSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: AddressSchema, required: true }, // Embedded address document
  events: [EventSchema],
});

// Ensure indexing for faster queries on event dates
FarmSchema.index({ 'events.start': 1, 'events.end': 1 });

const PlaceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  farms: [FarmSchema],
});

// Indexing to optimize queries on nested events
PlaceSchema.index({ 'farms.events.start': 1, 'farms.events.end': 1 });

const StateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  places: [PlaceSchema],
});

// Indexing on deeply nested event start and end fields
StateSchema.index({ 'places.farms.events.start': 1, 'places.farms.events.end': 1 });

const Calender = mongoose.model('Calender', StateSchema);

module.exports = Calender;
