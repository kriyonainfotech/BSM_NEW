const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Updated PurchaseBill schema for multiple products
const PurchaseBillSchema = new Schema({
  accountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Account",
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  billNo: {
    type: String,
    required: true, // This field is now required
  },
  items: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        min: 1,
      },
      mrp: {
        type: Number,
        required: true,
        min: 0,
      },
      purchaseRate: {
        type: Number,
        required: true,
        min: 0,
      },
      saleRate: {
        type: Number,
        required: true,
        min: 0,
      },
      totalAmount: {
        type: Number,
        required: true,
        min: 0,
      },
    },
  ],
  discount: {
    type: Number,
    default: 0, // Default to 0 if no discount is provided
  },
  grandTotal: {
    type: Number,
    required: true,
    min: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("PurchaseBill", PurchaseBillSchema);
