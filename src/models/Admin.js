const adminSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    userType: {
        type: String,
        enum: [ 'Admin'],  // Three user types
        default: 'Admin'  
    }
  });
  
  const Admin = mongoose.model('Admin', adminSchema);
  module.exports = Admin;
  