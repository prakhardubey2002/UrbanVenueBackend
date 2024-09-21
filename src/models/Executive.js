const mongoose = require('mongoose');

const executiveSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  userId: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  joiningDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  status: {
    type: String,
    enum: ['Working', 'Resigned', 'Terminated'],
    default: 'Working'
  },
  userType: {
    type: String,
    enum: [ 'Executive'],  // Three user types
    default: 'Executive'  
}
});

const Executive = mongoose.model('Executive', executiveSchema);
module.exports = Executive;
