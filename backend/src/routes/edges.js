const express = require("express");
const router = express.Router();

const Edge = require("../models/Edge");

// Create Edge
router.post("/add", async (req, res) => {
  try {
    const edge = new Edge(req.body);
    await edge.save();
    res.status(201).json(edge);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get All Edges
router.get("/all", async (req, res) => {
  try {
    const edges = await Edge.find();
    res.json(edges);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;