const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  units: {
    type: [
      {
        type: String,
        enum: ['psc', 'liter', 'kg', 'g'],
        required: true,
      }
    ],
    required: true,
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  image: {
    type: String, // This will store the path or URL of the image
    required: true,
  },

}, {
  timestamps: true,
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
