const express = require("express");
const router = express.Router();
const mongoose = require('mongoose');
const Station = require('../models/Station');

const Node = require("../models/Node");

// Create Node
router.post("/add", async (req, res) => {
  try {
    const {nodeID, station, name, location} = req.body;
    if(!nodeID || !station ||!name)
    {
      return res.status(400).json({
        success: false,
        message:"nodeID, station and name are required"
      });
    }

    if(!mongoose.Types.ObjectId.isValid(station))
    {
      return res.status(400).json({
        success:false,
        message: "Station provided is not valid"
      });
    }

    // checking whether the station exist...
    const existingStation = await Station.findById(station);
    if(!existingStation)
    {
      return res.status(400).json({
        success: false,
        message:"Station provided does not exist"
      });
    }

    // Preventing duplicate nodeID inside the same station...
    const existingNode = await Node.findOne({
      nodeID,
      station
    });
    if(existingNode)
    {
      return res.status(404).json({
        success: false,
        message:`Node ID ${nodeID} already exist in this station`
      });
    }

    // create node
    const node = await Node.create({
      nodeID,
      station,
      name,
      location
    });
    return res.status(201).json({
      success: true,
      message:"Node created successfully"
    })
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get All Nodes
router.get("/all", async (req, res) => {
  try {
    const nodes = await Node.find();
    
    return res.status(200).json({
      success:true,
      count: nodes.length,
      data: nodes
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;