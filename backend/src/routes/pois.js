const express = require("express");
const router = express.Router();

const POI = require("../models/POI");

// Create POI
router.post("/add", async (req, res) => {
  try {
    const poi = new POI(req.body);
    await poi.save();
    res.status(201).json(poi);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get All POIs
router.get("/all", async (req, res) => {
  try {
    const pois = await POI.find();
    res.json(pois);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;