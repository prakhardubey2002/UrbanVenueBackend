const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
    guestName: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        required: true
    },
    propertyName: {
        type: String,
        required: true
    },
    bookingDate: {
        type: Date,
        required: true
    },
    checkIn: {
        type: String,
        required: true
    },
    checkInTime: {
        type: Date, // Date type can represent both date and time
        required: true
    },
    checkOut: {
        type: String,
        required: true
    },
    checkOutTime: {
        type: Date, // Date type can represent both date and time
        required: true
    },
    maximumPeople: {
        type: Number,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true,
        enum: ['Confirmed', 'Pending', 'Canceled']
    },
    total: {
        type: Number, // Changed to Number to represent currency as a number
        required: true
    },
    advance: {
        type: Number, // Changed to Number to represent currency as a number
        required: true
    },
    pending: {
        type: Number, // Changed to Number to represent currency as a number
        required: true
    },
    security: {
        type: Number, // Changed to Number to represent currency as a number
        required: true
    },
    paymentMode: {
        type: String,
        required: true
    },
    action: {
        type: String,
        required: true
    }
});

BookingSchema.pre('save', function(next) {
    
    next();
});

const Booking = mongoose.model('Booking', BookingSchema);

module.exports = Booking;
