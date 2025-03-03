const mongoose = require("mongoose");

const CounterSchema = new mongoose.Schema({
  modelName: { type: String, required: true, unique: true },
  counter: { type: Number, required: true, default: 0 },
});

const Counter = mongoose.model("Counter", CounterSchema);

module.exports = Counter;
