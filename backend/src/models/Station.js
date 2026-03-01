const mongoose = require('mongoose');

const stationSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
    },
    code:{
        type: String,
        required: true,
        unique: true,
    },
    city:String,
    state:String,

    // Rough boundary of the station....
    boundary: {
        minLat: Number,
        maxLat: Number,
        minLng: Number,
        maxLng: Number,
    },
});

module.exports = mongoose.model("Station",stationSchema);