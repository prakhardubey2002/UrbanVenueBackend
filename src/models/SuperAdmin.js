const superadminSchema = new mongoose.Schema({
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
        enum: ['SuperAdmin'],  // Three user types
        default: 'SuperAdmin'  // Default to 'Executive'
    }
})

const Superadmin = mongoose.model('Superadmin', superadminSchema)
module.exports = Superadmin
