const mongoose = require('mongoose');

// Define the Occasion schema
const occasionSchema = new mongoose.Schema({
  id: {
    type: String,  
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
    unique: true,
  },
});

// Create the Occasion model from the schema
const Occasion = mongoose.model('Occasion', occasionSchema);

module.exports = Occasion;
