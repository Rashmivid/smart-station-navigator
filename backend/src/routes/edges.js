const express = require("express");
const router = express.Router();
const mongoose = require('mongoose');
const Edge = require("../models/Edge");
const Node = require('../models/Node');
const Station = require('../models/Station');


// Create Edge
router.post("/add", async (req, res) => {
  try {
    const {source, target, cost, station} = req.body;

    // validate the entered field...
    if(source === undefined || target === undefined || cost===undefined || !station)
    {
      return res.status(404).json({
        success: false,
        message:"source, target, cost and station required"
      });
    }
    if(!mongoose.Types.ObjectId.isValid(station))
    {
      return res.status(404).json({
        success: false,
        message:"Invalid station ID"
      });
    }

    const sourceNodeID = Number(source);
    const targetNodeID = Number(target);
    const edgeCost = Number(cost);
    
    if(!Number.isInteger(sourceNodeID) || !Number.isInteger(targetNodeID)){
      return res.status(404).json({
        success: false,
        message:"Node IDs must be in Number"
      });
    }
    if(sourceNodeID === targetNodeID)
    {
      return res.status(404).json({
        success: false,
        message: "Source and target must not be same"
      });
    }
    if(!Number.isFinite(edgeCost) || edgeCost<=0)
    {
      return res.status(404).json({
        success: false,
        message:"Provided edge cost is not valid"
      });
    }

    const existingStation = await Station.findById(station);
    if(!existingStation)
    {
      return res.status(404).json({
        success: false,
        message:"Station does not exist"
      });
    }
    const sourceNode = await Node.findOne({
      nodeID:sourceNodeID,
      station
    });
    if(!sourceNode)
    {
      return res.status(404).json({
        success: false,
        message:"source node does not exist"
      })
    }
    const targetNode = await Node.findOne({
      nodeID:targetNodeID,
      station
    });
    if(!targetNode)
    {
      return res.status(404).json({
        success:false,
        message:"target node does not exist"
      });
    }
    // Prevent duplicate edgesin both direction...
    const existingEdge = await Edge.findOne({
      station,
      $or:[
        {
          source: sourceNodeID,
          target: targetNodeID
        },
        {
          source: targetNodeID,
          target: sourceNodeID
        }
      ]
    });
    if(existingEdge){
      return res.status(404).json({
        success: false,
        message: "Edge already exists"
      });
    }

    // create edges...
    const edge = await Edge.create({
      source:sourceNodeID,
      target: targetNodeID,
      cost: edgeCost,
      station
    });
    return res.status(201).json({
      success: true,
      message: "Edge added successfully",
      data: edge
    });
  } 
  catch (error) {
    console.error("Create Edge Error: ",error);
    res.status(500).json({
      success: false,
      message: error.message 
    });
  }
});

// Get All Edges
router.get("/all", async (req, res) => {
  try {
    const edges = await Edge.find().populate(
      "station",
      "name code"
    );
    return res.status(200).json({
      success: true,
      count: edges.length,
      data: edges
    })
  } catch (error) {
    res.status(500).json({
      success: false, 
      message: error.message
    });
  }
});

module.exports = router;