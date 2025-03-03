const mongoose = require("mongoose");

const ProductStockSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product", // Reference to Product model
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Assumes there's a User model this references
    required: true,
  },
  stocks: [
    {
      purchaseRate: {
        type: Number, // Added purchaseRate here
        required: true,
      },
      mrp: {
        type: Number,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
      purchaseBillId: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "PurchaseBill",
          required: true,
        },
      ],
    },
  ],
  totalStock: {
    type: Number,
    required: true,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("ProductStock", ProductStockSchema);
