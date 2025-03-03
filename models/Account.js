const mongoose = require('mongoose');

const AccountSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
  accountHolderName: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  mobileNumber: {
    type: String,
    required: true,
    unique: true, // Ensures no two accounts have the same mobile number
  },
  accountType: {
    type: String,
    required: true,
    enum: ['saler', 'purchase'], // Only allows values 'saler' or 'purchase'
  }
}, { timestamps: true });

const Account = mongoose.model('Account', AccountSchema);

module.exports = Account;
