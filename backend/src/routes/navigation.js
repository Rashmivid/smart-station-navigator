const express = require("express");
const router = express.Router();

const navigationController = require("../controllers/navigationController");

router.get("/", navigationController.getNavigation);

router.get("/nearest-poi",navigationController.getNearestPOI);
router.get("/nearby-pois",navigationController.getNearbyPOIs);

router.get("/route-to-poi",navigationController.getRouteToPOI);

module.exports = router;