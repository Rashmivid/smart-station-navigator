const Edge = require("../models/Edge");
const Node = require("../models/Node");
const mongoose = require('mongoose');
const POI = require("../models/POI");

const { buildGraph, dijkstra } = require("../utils/graph");

exports.getNearestPOI = async (req,res) =>{
  try{
    const {station , start, type } = req.query;

    if(!station || !start || !type)
    {
      return res.status(400).json({
        success: false,
        message: "Station, Start, type are required field"
      });
    }

    if(!mongoose.Types.ObjectId.isValid(station))
    {
      return res.status(400).json({
        success: false,
        message: "Station is Invalid"
      });
    }

    const stationID = new mongoose.Types.ObjectId(station);

    const startNode = Number(start);
    if(!Number.isInteger(startNode))
    {
      return res.status(400).json({
        success: false,
        message: "Start node must be integer value"
      });
    }

    const startingNode = await Node.findOne({
      station: stationID,
      nodeID : startNode
    });

    if(!startingNode)
    {
      return res.status(400).json({
        success: false,
        message: "Starting node not found in the station"
      });
    }

    const pois = await POI.find({
      station : stationID,
      type: type
    });

    if(!pois.length)
    {
      return res.status(400).json({
        success: false,
        message: `No such POI is fount with type '${type}'.`
      });
    }

    const edges = await Edge.find({
      station: stationID
    });

    if(!edges.length)
    {
      return res.status(400).json({
        success: false,
        message: "No edges are found for the selected station"
      });
    }

    const graph = buildGraph(edges);
    let nearestPOI = null;

    for (const poi of pois)
    {
      const result = dijkstra(
        graph,
        startNode,
        poi.nodeID
      );

      if(result.distance == null)
      {
        continue;
      }
      if(
        nearestPOI === null ||
        result.distance < nearestPOI.distance
      )
      {
        nearestPOI = {
          poi,
          distance: result.distance,
          path: result.path
        };
      } 
    }

    if(!nearestPOI)
    {
      return res.status(400).json({
        success: false,
        message: "POI is not reachable"
      });
    }

    const routeNodes = await Node.find({
      station: stationID,
      nodeID: { $in: nearestPOI.path }
    });

    const nodeMap = {};
    routeNodes.forEach((node) => {
      nodeMap[node.nodeID] = node.name;
    });


    const readablePath = nearestPOI.path.map(
      (nodeId) => nodeMap[nodeId] || `Node ${nodeId}`
    );

    return res.status(200).json({
      success: true,
      message: "Nearest POI found successfully.",
      data: {
        poi: {
          name: nearestPOI.poi.name,
          type: nearestPOI.poi.type,
          nodeID: nearestPOI.poi.nodeID,
          location: nearestPOI.poi.location
        },
        distance: nearestPOI.distance,
        path: readablePath
      }
    });
   
  }

catch{
  return res.status(500).json({
      success: false,
      message: "Internal Server Error."
    });
}
};

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

exports.getNearbyPOIs = async (req,res) =>{
  try{
    const{ station ,start, type} = req.query;

    if(!station || !start || !type)
    {
      return res.status(400).json({
        success: false,
        message: "Station, start and type is required"
      });
    }

    if(!mongoose.Types.ObjectId.isValid(station))
    {
      return res.status(400).json({
        success: false,
        message: "Station ID is not valid"
      });
    }

    const stationId = new mongoose.Types.ObjectId(station);
    const startNode = Number(start);

    if(!Number.isInteger(startNode))
    {
      return res.status(400).json({
        success: false,
        message:"Start node must be integer"
      });
    }
    const startingNode = await Node.findOne({
      station: stationId,
      nodeID: startNode
    });

    if(!startingNode)
    {
      return res.status(400).json({
        success: false,
        message: "Starting node not found in the selected station"
      });
    }

    const pois = await POI.find({
      station: stationId,
      type: type
    });

    if(!pois.length)
    {
      return res.status(400).json({
        success: false,
        message: `No POI is found with type '${type}'.`
      });
    }

    const edges = await Edge.find({
      station: stationId
    });

    if(!edges.length)
    {
      return res.status(400).json({
        success: false,
        message: "No edge is found for the selected station"
      });
    }

    const graph = buildGraph(edges);

    const nearbyPOIs = [];
    for (const poi of pois) {

      const result = dijkstra(
        graph,
        startNode,
        poi.nodeID
      );
      if(result.distance === null) 
      {
        continue;
      }
      nearbyPOIs.push({
        name: poi.name,
        type: poi.type,
        nodeId: poi.nodeID,
        location: poi.location,
        distance: result.distance,
        path: result.path
      });
    }
    if(!nearbyPOIs.length) 
    {
      return res.status(404).json({
        success: false,
        message: "No reachable POIs found."
      });
    }
    nearbyPOIs.sort(
      (firstPOI, secondPOI) =>firstPOI.distance - secondPOI.distance
    );
    const allRouteNodeIds = [
      ...new Set(
        nearbyPOIs.flatMap((poi) => poi.path)
      )
    ];
    const routeNodes = await Node.find({
      station: stationId,
      nodeID: { $in: allRouteNodeIds }
    });
    const nodeMap = {};

    routeNodes.forEach((node) => {
      nodeMap[node.nodeID] = node.name;
    });

    nearbyPOIs.forEach((poi) => {
      poi.path = poi.path.map(
        (nodeId) =>
          nodeMap[nodeId] || `Node ${nodeId}`
      );
    });
    return res.status(200).json({
      success: true,
      message: "Nearby POIs found successfully.",
      data: {
        count: nearbyPOIs.length,
        pois: nearbyPOIs
      }
    });
}
catch(error){
  console.error(error);
  return res.status(500).json({
      success: false,
      message: "Internal Server Error."
    });
  }
};

exports.getRouteToPOI = async(req,res) =>{
  try{
    const {station, start, poiID} = req.query;
    if(!station || !start || !poiID)
    {
      return res.status(400).json({
        success: false,
        message: "Station, start and poiID field are required"
      });
    }

    if(!mongoose.Types.ObjectId.isValid(station)|| 
      !mongoose.Types.ObjectId.isValid(poiID))
    {
        return res.status(400).json({
          success: false,
          message: "Station or poiID is invalid"
        });
    }

    const stationID = new mongoose.Types.ObjectId(station);
    const startNode = Number(start);

    if(!Number.isInteger(startNode))
    {
      return res.status(400).json({
        success: false,
        message: "Start node must be valid Integer"
      });
    }

    const startingNode = await Node.findOne({
      station:stationID,
      nodeID: startNode
    });

    if(!startingNode)
    {
      return res.status(400).json({
        success: false,
        message: "Start node not found in the selected station"
      });
    }

    const poi = await POI.findOne({
      _id: poiID,
      station: stationID
    });

    if(!poi)
    {
      return res.status(400).json({
        success: false,
        message: "POI not found in the selected station"
      });
    }

    const edges = await Edge.find({
      station: stationID
    });

    if(!edges.length)
    {
      return res.status(400).json({
        success: false,
        message: "No edge found for the selected station"
      });
    }

    const graph = buildGraph(edges);

    const result = dijkstra(
      graph,
      startNode,
      poi.nodeID
    );

    if(result.distance === null || result.path.length === 0) 
    {
      return res.status(404).json({
        success: false,
        message: "No route exists to the selected POI."
      });
    }

    const routeNodes = await Node.find({
      station: stationID,
      nodeID: { $in: result.path }
    });

    const nodeMap = {};

    routeNodes.forEach((node) => {
      nodeMap[node.nodeID] = node.name;
    });

    const readablePath = result.path.map(
      (nodeId) =>
        nodeMap[nodeId] || `Node ${nodeId}`
    );

    return res.status(200).json({
      success: true,
      message: "Route to POI found successfully.",
      data: {
        poi: {
          id: poi._id,
          name: poi.name,
          type: poi.type,
          nodeID: poi.nodeID,
          location: poi.location
        },
        distance: result.distance,
        path: readablePath
      }
    });
    
  }
  catch(error)
  {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error."
    });

  }
};