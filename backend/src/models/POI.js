const mongoose = require('mongoose');
const poiSchema = new mongoose.Schema({
    name: {
        type:String,
        required: true,
        trim: true
    },
    type:{
        type:String,
        enum:[
            "platform",
            "waiting_room",
            "coffee_shop",
            "washroom",
            "entry_gate",
            "exit_gate",
            "ticket_counter",
            "lounge",
        ],
        required:true,

    },
    location: {
        lat: Number,
        lng: Number,
    },
    nodeId:{
        type: Number,
        required: true
    },
    station:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Station",
        required: true,

    }
},
    {
        timeStamps: true
    }
);
module.exports = mongoose.model("POI",poiSchema);