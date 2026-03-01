const mongoose = require("mongoose");

const edgeSchema = new mongoose.Schema({
  from: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Node",
    required: true,
  },
  to: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Node",
    required: true,
  },

  distance: {
    type: Number, // meters
    required: true,
  },

  station: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Station",
    required: true,
  },
});

module.exports = mongoose.model("Edge", edgeSchema);