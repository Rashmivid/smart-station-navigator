const Edge = require("../models/Edge");
const Node = require("../models/Node");

const { buildGraph, dijkstra } = require("../utils/graph");

exports.getNavigation = async (req, res) => {
  try {

    const { station, start, end } = req.query;

    const startNode = Number(start);
    const endNode = Number(end);
    const stationId = Number(station);

    // get edges of that station
    const edges = await Edge.find({ station: stationId });

    if (!edges.length) {
      return res.status(404).json({ message: "No edges found for this station" });
    }

    // build graph
    const graph = buildGraph(edges);

    // run dijkstra
    const result = dijkstra(graph, startNode, endNode);

    if (!result || !result.path) {
      return res.status(404).json({ message: "No path found" });
    }

    // get readable node names
    const nodes = await Node.find({ nodeId: { $in: result.path } });

    const nodeMap = {};
    nodes.forEach(n => {
      nodeMap[n.nodeId] = n.name;
    });

    const readablePath = result.path.map(id => nodeMap[id] || id);

    res.json({
      distance: result.distance,
      path: readablePath
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Navigation error" });
  }
};