const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
    },
    mobileNumber: {
      type: String,
      unique: true,
      sparse: true,
    },
    address: {
      type: String,
    },
    otp: { type: String }, // Store OTP temporarily
    otpExpires: { type: Date }, // Store OTP expiration timestamp
    isVerified: { type: Boolean, default: false },
    isLoggedin: {
      type: Boolean,
      default: false,
    },
    lastLoginTime: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
