const mongoose = require('mongoose');

const nodeSchema = new mongoose.Schema({
    nodeId:{
        type:String,
        required:true,
    },
    location:{
        lat:Number,
        lng:Number,
    },
    station:{
        type:mongoose.Schema.Types.ObjectId,
        ref: "Station",
        required: true,
    },

});
module.exports = mongoose.model("Node",nodeSchema);