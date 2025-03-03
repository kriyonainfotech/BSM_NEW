const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SaleBillSchema = new Schema({
  salesmanId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Salesman",
    required: true,
  },
  accountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Account",
    required: true,
  },
  products: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      quantity: { type: Number, required: true, min: 1 },
      freeQuantity: { type: Number, default: 0 },
      mrp: { type: Number, required: true },
      saleRate: { type: Number, required: true },
      purchaseRate: { type: Number },
      amount: { type: Number, required: true },
      netAmount: { type: Number },
      discount: { type: Number, default: 0 },
      totalAmount: { type: Number, required: true },
      purchaseId: { type: mongoose.Schema.Types.ObjectId, ref: "PurchaseBill" }, // Which purchase bill was used for thi sale?
      stockId: { type: mongoose.Schema.Types.ObjectId, ref: "ProductStock" }, // Track exact stock entry
    },
  ],
  grandTotal: { type: Number, required: true },
  cashDiscount: {
    type: Number,
    default: 0, // Cash discount given during payment
  },
  billNo: {
    type: String,
    required: true,
    unique: true,
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("SaleBill", SaleBillSchema);
