const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

// Booking schema for additional booking-related details
const BookingSchema = new mongoose.Schema({
  guestName: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  checkInDate: { type: Date, required: true },
  checkInTime: { type: String, required: true }, // Assuming time as a string in HH:mm format
  checkOutDate: { type: Date, required: true },
  checkOutTime: { type: String, required: true }, // Assuming time as a string in HH:mm format
  maxPeople: { type: Number, required: true },
  occasion: { type: String }, // Optional
  hostOwnerName: { type: String, required: true },
  hostNumber: { type: String, required: true },
  totalBooking: { type: Number, required: true },
  advance: { type: Number, required: true },
  balancePayment: { type: Number, required: true },
  securityAmount: { type: Number, required: true },
  status: { type: String, required: true, enum: ['confirmed', 'pending', 'cancelled'] }, // Status can be 'confirmed', 'pending', 'cancelled', etc.
});

const EventSchema = new mongoose.Schema({
  _id: { type: String, default: uuidv4 },
  title: { type: String, required: true },
  start: { type: Date, required: true },
  end: { type: Date, required: true },
  bookings: [BookingSchema], // Embedding BookingSchema for event-specific bookings
});

const AddressSchema = new mongoose.Schema({
  addressLine1: { type: String, required: true },
  addressLine2: { type: String },
  country: { type: String, required: true },
  state: { type: String, required: true },
  suburb: { type: String },
  zipCode: { type: String, required: true },
});

// Add a details field in the farm schema to hold additional details about the farm
const FarmSchema = new mongoose.Schema({
  farmId: { type: String, required: true },
  address: { type: AddressSchema, required: true }, // Embedded address document
  details: {
    name: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    checkInDate: { type: Date, required: true },
    checkInTime: { type: String, required: true },
    checkOutDate: { type: Date, required: true },
    checkOutTime: { type: String, required: true },
    maxPeople: { type: Number, required: true },
    occasion: { type: String }, // Optional
    hostOwnerName: { type: String, required: true },
    hostNumber: { type: String, required: true },
    totalBooking: { type: Number, required: true },
    advance: { type: Number, required: true },
    balancePayment: { type: Number, required: true },
    securityAmount: { type: Number, required: true },
    status: { type: String, required: true, },
  },
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
