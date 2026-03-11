const express = require("express");
const app = express();

app.use(express.json());

const navigationRoutes = require("./routes/navigation");
const stationRoutes = require("./routes/stations");
const nodeRoutes = require("./routes/nodes");
const edgeRoutes = require("./routes/edges");
const poiRoutes = require("./routes/pois");


app.use("/api/stations", stationRoutes);
app.use("/api/nodes", nodeRoutes);
app.use("/api/edges", edgeRoutes);
app.use("/api/pois", poiRoutes);
app.use("/api/navigation", navigationRoutes);

module.exports = app;