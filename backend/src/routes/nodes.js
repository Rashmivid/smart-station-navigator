const express = require("express");
const router = express.Router();

const Node = require("../models/Node");

// Create Node
router.post("/add", async (req, res) => {
  try {
    const node = new Node(req.body);
    await node.save();
    res.status(201).json(node);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get All Nodes
router.get("/all", async (req, res) => {
  try {
    const nodes = await Node.find();
    res.json(nodes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;