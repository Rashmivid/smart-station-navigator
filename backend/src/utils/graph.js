function buildGraph(edges) {
  const graph = {};

  edges.forEach(edge => {
    const source = edge.source;
    const target = edge.target;
    const cost = Number(edge.cost);

    if (!graph[source]) {
      graph[source] = [];
    }

    if (!graph[target]) {
      graph[target] = [];
    }

    graph[source].push({
      node: target,
      cost: cost
    });

    graph[target].push({
      node: source,
      cost: cost
    });
  });

  return graph;
}

module.exports = buildGraph;


function dijkstra(graph, start, end) {

  const distances = {};
  const previous = {};
  const visited = new Set();

  Object.keys(graph).forEach(node => {
    distances[node] = Infinity;
  });

  distances[start] = 0;

  while (true) {

    let closestNode = null;

    Object.keys(distances).forEach(node => {
      if (!visited.has(node)) {
        if (closestNode === null || distances[node] < distances[closestNode]) {
          closestNode = node;
        }
      }
    });

    if (closestNode === null) break;

    if (closestNode == end) break;

    visited.add(closestNode);

    graph[closestNode].forEach(neighbor => {

      const newDist = distances[closestNode] + neighbor.cost;

      if (newDist < distances[neighbor.node]) {
        distances[neighbor.node] = newDist;
        previous[neighbor.node] = closestNode;
      }

    });
  }

  if (distances[end] === Infinity) {
  return {
    distance: null,
    path: []
  };
}

  const path = [];
  let current = end;


  while (current !==undefined) {
    path.unshift(current);
    current = previous[current];
  }

  return {
    distance: distances[end],
    path: path
  };

}

module.exports = { buildGraph, dijkstra };