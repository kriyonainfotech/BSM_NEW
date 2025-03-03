const mongoose = require("mongoose");

const SalesmanSchema = new mongoose.Schema(
  {
    salesman: {
      type: String,
      required: true,
      trim: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Assumes there's a User model this references
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Salesman", SalesmanSchema);
