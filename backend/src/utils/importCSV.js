require("dotenv").config();
const mongoose = require("mongoose");
const csv = require("csvtojson");

const connectDB = require("../config/db");
const Node = require("../models/Node");
const Edge = require("../models/Edge");

const importData = async () => {

  await connectDB();

  const path = require("path");

const nodes = await csv().fromFile(
  path.join(__dirname, "../data/nodes.csv")
);

const edges = await csv().fromFile(
  path.join(__dirname, "../data/edges.csv")
);
console.log("Nodes loaded:", nodes.length);
console.log("Edges loaded:", edges.length);

  const formattedNodes = nodes.map(n => ({
  nodeId: n.id,          // from CSV
  station: n.station_id, // keep as number for now
  name: n.name,
  location: {
    lat: parseFloat(n.latitude),
    lng: parseFloat(n.longitude)
  }
}));

 const formattedEdges = edges.map(e => ({
  edgeId: e.id,
  station: e.station_id,
  source: e.source,
  target: e.target,
  cost: parseFloat(e.cost)
}));

  await Node.insertMany(formattedNodes);
  await Edge.insertMany(formattedEdges);

  console.log("CSV Data Imported Successfully");

  process.exit();
};

importData();