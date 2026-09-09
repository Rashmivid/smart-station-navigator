const express = require("express");
const mongoose = require('mongoose');
const router = express.Router();

const POI = require("../models/POI");
const Node = require("../models/Node");
const Station = require("../models/Station");

// Create POI
router.post("/add", async (req, res) => {
  try {
    const {
      name,
      type,
      location,
      nodeID,
      station
    } = req.body;
    
    if(!name || !type || !location || !station || nodeID == undefined)
    {
      return res.status(400).json({
        success: false,
        message: "name, type, location, node, station are required"
      });
    }

    if(!mongoose.Types.ObjectId.isValid(station))
    {
      return res.status(400).json({
        success: false,
        message:"Station is invalid"
      });
    }

    const stationID = new mongoose.Types.ObjectId(station);

    const nodeId = Number(nodeID);
    if(!Number.isInteger(nodeId)){
      return res.status(400).json({
        success: false,
        message: "NodeID must be of integer value"
      });
    }

    if(typeof location.lat !== "number" || typeof location.lng !== "number")
    {
      return res.status(400).json({
        success: false,
        message: "Location must contain valid latitude and longitude"
      });
    }

    const existingStation = await Station.findById(stationID);
    
    if(!existingStation)
    {
      return res.status(400).json({
        success: false,
        message: "Station not found"
      });
    }

    const existingNode = await Node.findOne({
      nodeID : nodeId,
      station: stationID
    });

    if(!existingNode)
    {
      return res.status(400).json({
        success: false,
        message: "Node not found in this station"
      });
    }

    const poi = await POI.create({
      name,
      type,
      location,
      nodeID: nodeId,
      station : stationID,

    });
    return res.status(201).json({
      success: true,
      message: "POI created successfully",
      data: poi
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get All POIs
router.get("/all", async (req, res) => {
  try {
    const pois = await POI.find().populate("station", "name code");
    return res.status(201).json({
      success: true,
      count : pois.length,
      data: pois
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;