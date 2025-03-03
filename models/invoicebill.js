const mongoose = require("mongoose");

const InvoiceBillSchema = new mongoose.Schema({
  saleBillId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SaleBill",
    required: true,
  },
  billNo: {
    type: String,
    required: true,
    unique: true, // Make sure the bill number is unique
  },
  totalSaleAmount: {
    type: Number,
    required: true,
  },
  kasar: {
    type: Number,
    default: 0, // Discount on the total bill
  },
  cashDiscount: {
    type: Number,
    default: 0, // Cash discount given during payment
  },
  totalProducts: {
    type: Number,
    required: true,
  },
  totalCostAmount: {
    type: Number,
    required: true,
  },

  totalProfitOrLoss: {
    type: Number,
    required: true,
  },
  profitOrLossPerProduct: {
    type: Number,
    required: true,
  },
  isProfit: {
    type: Boolean,
    required: true,
  },
  paymentReceived: {
    type: Number,
    default: 0, // Tracks total payments received
  },
  balanceDue: {
    type: Number,
    default: function () {
      return this.totalSaleAmount - this.paymentReceived; // Balance due after payment
    },
  },
  paymentStatus: {
    type: String,
    enum: ["Pending", "Paid"],
    default: "Pending", // Payment status: 'Pending' or 'Paid'
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const InvoiceBill = mongoose.model("InvoiceBill", InvoiceBillSchema);

module.exports = InvoiceBill;
