const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  bookingId: { type: String, required: true },
  guestName: { type: String, required: true },
  email: { type: String },  
  phoneNumber: { type: String, required: true },
  checkInDate: { type: Date, required: true },
  checkInTime: { type: String, required: true },
  checkOutDate: { type: Date, required: true },
  checkOutTime: { type: String, required: true },
  numberOfAdults: { type: Number },  
  numberOfKids: { type: Number },  
  occasion: { type: String, required: true },
  bookingpartnerid: { type: String, required: true },
  bookingPartnerName: { type: String },  
  bookingPartnerPhoneNumber: { type: String },  
  hostOwnerName: { type: String, required: true },
  hostNumber: { type: String, required: true },
  totalBooking: { type: Number, required: true },
  farmTref: { type: Number, required: true },
  otherServices: { type: Number },
  advance: { type: Number, required: true },
  advanceCollectedBy: { type: String },
  pendingCollectedBy: { type: String },
  advanceMode: { type: String, default: 'cash' },
  balancePayment: { type: Number, required: true },
  securityAmount: { type: Number },
  urbanvenuecommission: { type: Number },
  venue: { type: String, required: true },
  addressLine1: { type: String },
  addressLine2: { type: String },
  country: { type: String },
  state: { type: String },
  citySuburb: { type: String },
  zipCode: { type: String },
  termsConditions: { type: String },
  maplink: { type: String },
  eventAddOns: { type: String },  // Added event add-ons field
  status: {
    type: String,
    enum: ['Canceled', 'Paid', 'Upcoming', 'Completed'],
    required: true,
  },
  photo: { type: String },
  surplus: { type: String,required: true },
  deficit: { type: String,required: true },
  fullcloser :{type: String,required: true}
});

const Invoice = mongoose.model('Invoice', invoiceSchema);
module.exports = Invoice;
