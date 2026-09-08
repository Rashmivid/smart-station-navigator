const mongoose = require("mongoose");

const edgeSchema = new mongoose.Schema(
  {
    source:{
      type: Number,
      required: true
    },
    target:{
      type: Number,
      required: true
    },
    cost:{
      type:Number,
      required: true,
      min: 0
    },
    station:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Station",
      required: true
    }
},
{
  timestamps: true
}
);

module.exports = mongoose.model("Edge", edgeSchema);