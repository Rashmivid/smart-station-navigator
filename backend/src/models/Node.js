const mongoose = require("mongoose");

const nodeSchema = new mongoose.Schema({
  nodeID: {
    type: Number,
    required: true
  },
  station: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Station",
    required: true
  },
  name: {
    type: String,
    required: true
  },
  location: {
    lat: Number,
    lng: Number
  }
},
{
  timestamps: true
}
);

module.exports = mongoose.model("Node", nodeSchema);