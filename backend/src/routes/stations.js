const express = require("express");
const router = express.Router();

const Station = require("../models/Station");

// Create Station
router.post("/add", async (req, res) => {
  try {
    const station = new Station(req.body);
    await station.save();
    res.status(201).json(station);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get All Stations
router.get("/all", async (req, res) => {
  try {
    const stations = await Station.find();
    res.json(stations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;