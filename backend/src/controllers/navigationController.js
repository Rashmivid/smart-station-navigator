const Edge = require("../models/Edge");
const Node = require("../models/Node");

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

    // Convert query parameters to numbers
    const stationId = Number(station);
    const startNode = Number(start);
    const endNode = Number(end);

    // Validate numbers
    if (
      Number.isNaN(stationId) ||
      Number.isNaN(startNode) ||
      Number.isNaN(endNode)
    ) {
      return res.status(400).json({
        success: false,
        message: "Station, start and end must be valid numbers."
      });
    }

    // Check whether start and end nodes exist in the station
    const existingNodes = await Node.find({
      station: stationId,
      nodeId: { $in: [startNode, endNode] }
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
    const node = await Node.findOne({
      station: stationId,
      nodeId: startNode
    });

  return res.status(200).json({
    success: true,
    message: "Start and destination are the same.",
    data: {
      station: stationId,
      distance: 0,
      path: [node.name]
    }
  });
}

    // Fetch edges for the station
    const edges = await Edge.find({ station: stationId });

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
      nodeId: { $in: result.path }
    });

    const nodeMap = {};

    nodes.forEach((node) => {
      nodeMap[node.nodeId] = node.name;
    });

    const readablePath = result.path.map(
      (id) => nodeMap[id] || `Node ${id}`
    );

    return res.status(200).json({
      success: true,
      message: "Navigation route found successfully.",
      data: {
        station: stationId,
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