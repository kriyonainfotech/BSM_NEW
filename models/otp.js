const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    email: { type: String, required: true },
    mobileNumber: {
        type: String,
        unique: true,
        sparse: true
      }, 
    otp: { type: Number, required: true },
    otpExpires: { type: Date, required: true },
});

module.exports = mongoose.model('Otp', otpSchema);

