const mongoose = require("mongoose");

const nodeSchema = new mongoose.Schema({
  nodeId: {
    type: Number,
    required: true
  },
  station: {
    type: Number,
    required: true
  },
  name: String,
  location: {
    lat: Number,
    lng: Number
  }
});

module.exports = mongoose.model("Node", nodeSchema);