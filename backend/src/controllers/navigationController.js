const Edge = require("../models/Edge");
const Node = require("../models/Node");
const mongoose = require('mongoose');


const { buildGraph, dijkstra } = require("../utils/graph");

exports.getNavigation = async (req, res) => {
  try {
    const { station, start, end } = req.query;

    // Check if all query parameters are provided
    if (!station || !start || !end) {
      return res.status(400).json({
        success: false,
        message: "Station, start and end query parameters are required."
      });

    }
    // validate mongoDB objectId...
    if(!mongoose.Types.ObjectId.isValid(station))
    {
      return res.status(400).json({
        success:false,
        message: "Station ID does not exist"
      });
    }

    const stationID = new mongoose.Types.ObjectId(station);
    // Convert query parameters to numbers
    const startNode = Number(start);
    const endNode = Number(end);

    // Validate numbers
    if (
      !Number.isInteger(startNode) || !Number.isInteger(endNode)
    ) {
      return res.status(400).json({
        success: false,
        message: "Start and end must be valid node Id."
      });
    }

    // Check whether start and end nodes exist in the station
    const existingNodes = await Node.find({
      station:stationID,
      nodeID: { $in: [startNode, endNode] }
    });

    const expectedNodes = startNode === endNode ? 1 : 2;

  if (existingNodes.length !== expectedNodes) {
    return res.status(404).json({
      success: false,
      message: "Start or end node not found in the selected station."
    });
  }

    // If start and end are the same node
  if (startNode === endNode) {
    // const node = await Node.findOne({
    //   station,
    //   nodeId: startNode
    // });

  return res.status(200).json({
    success: true,
    message: "Start and destination are the same.",
    data: {
      station:stationID,
      distance: 0,
      path: [existingNodes[0].name]
    }
  });
}

    // Fetch edges for the station
    const edges = await Edge.find({
      station:stationID
    });

    if (!edges.length) {
      return res.status(404).json({
        success: false,
        message: "No edges found for the selected station."
      });
    }

    // Build graph
    const graph = buildGraph(edges);

    // Find shortest path
    const result = dijkstra(graph, startNode, endNode);

    if (result.distance === null || result.path.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No route exists between the selected nodes."
      });
    }

    // Fetch readable node names
    const nodes = await Node.find({
      station:stationID,
      nodeID: { $in: result.path }
    });

    const nodeMap = {};

    nodes.forEach((node) => {
      nodeMap[node.nodeID] = node.name;
    });

    const readablePath = result.path.map(
      (id) => nodeMap[id] || `Node ${id}`
    );

    return res.status(200).json({
      success: true,
      message: "Navigation route found successfully.",
      data: {
        station: stationID,
        distance: result.distance,
        path: readablePath
      }
    });

  } catch (error) {
    console.error("Navigation Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error."
    });
  }
};