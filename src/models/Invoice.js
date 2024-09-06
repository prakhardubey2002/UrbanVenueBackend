const mongoose = require('mongoose')

const invoiceSchema = new mongoose.Schema({
  bookingId: { type: String, required: true },
  guestName: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  checkInDate: { type: Date, required: true },
  checkInTime: { type: String, required: true },
  checkOutDate: { type: Date, required: true },
  checkOutTime: { type: String, required: true },
  maxPeople: { type: Number, required: true },
  occasion: { type: String, required: true },
  hostOwnerName: { type: String, required: true },
  hostNumber: { type: String, required: true },
  totalBooking: { type: Number, required: true },
  farmTref: { type: Number, required: true },
  otherServices: { type: Number },
  advance: { type: Number, required: true },
  advanceCollectedBy: {
    type: String,
  },
  pendingCollectedBy: {
    type: String,
  },
  showAdvanceDetails: { type: String, default: 'no' },
  advanceMode: { type: String, default: 'cash' },
  balancePayment: { type: Number, required: true },
  securityAmount: { type: Number },
  urbanvenuecommission: { type: Number },
  venue: { type: String, required: true },
  addressLine1: { type: String },
  addressLine2: { type: String },
  country: { type: String },
  city: { type: String },
  citySuburb: { type: String },
  zipCode: { type: String },
  termsConditions: { type: String },
  status: {
    type: String,
    enum: ['Canceled', 'Paid', 'Upcoming'],
    required: true,
  },
})

const Invoice = mongoose.model('Invoice', invoiceSchema)
module.exports = Invoice
