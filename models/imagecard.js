const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the schema for the flyer or business card
const flyerSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId, // Reference to the user who created the flyer
    ref: 'User', // Reference to the User model
    required: true
  },
  bgImageUrl: {
    type: String, // Store URL/path to the uploaded background image
    required: true
  },
  profilePicUrl: {
    type: String, // Store URL/path to the uploaded profile image
    required: true
  },
  email: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    required: true
  },
  companyName: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Create a model from the schema
const Flyer = mongoose.model('Flyer', flyerSchema);

module.exports = Flyer;
