const mongoose = require('mongoose')
const adminSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  phoneNumber: { type: String, required: true },
  joiningDate: { type: Date, required: true },
  endDate: { type: Date },
  status: {
    type: String,
    enum: ['Working', 'Resigned', 'Terminated'],
    default: 'Working',
  },
  userType: {
    type: String,
    enum: ['Admin'], // Three user types
    default: 'Admin',
  },
})

const Admin = mongoose.model('Admin', adminSchema)
module.exports = Admin
