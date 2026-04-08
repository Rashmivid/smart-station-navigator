const mongoose = require("mongoose");

const edgeSchema = new mongoose.Schema({
  edgeId: Number,
  station: Number,
  source: Number,
  target: Number,
  cost: Number
});

module.exports = mongoose.model("Edge", edgeSchema);