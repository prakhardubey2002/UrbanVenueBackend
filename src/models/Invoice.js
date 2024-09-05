// models/Invoice.js
const mongoose = require('mongoose')

const invoiceSchema = new mongoose.Schema({
  _id: { type: String, required: true },
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
  otherServices: { type: Number, required: true },
  advance: { type: Number, required: true },
  advanceCollectedBy: { type: String, required: true },
  showAdvanceDetails: { type: String, required: true },
  advanceMode: { type: String, required: true },
  balancePayment: { type: Number, required: true },
  securityAmount: { type: Number, required: true },
  urbanvenuecommission: { type: Number, required: true },
  termsConditions: { type: String },
  venue: { type: String, required: true },
  addressLine1: { type: String, required: true },
  addressLine2: { type: String },
  country: { type: String, required: true },
  city: { type: String, required: true },
  citySuburb: { type: String },
  zipCode: { type: String, required: true },
})

const Invoice = mongoose.model('Invoice', invoiceSchema)

module.exports = Invoice
