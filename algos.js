async function breadthFirstSearch(graph, start, end) {
  let queue = [];
  let visited = [];
  let parents = new Map();
  queue.push(start);
  visited.push(start);

  while (queue.length > 0) {
    let current = queue.shift();
    if (current === end) return parents;
    let neighbours = graph.getNeighbours(current);
    for (let neighbour of neighbours) {
      if (visited.includes(neighbour)) continue;
      await sleep(sleepTime);
      neighbour.isSearching = true;
      graph.getEdge(current, neighbour).isSearching = true;
      queue.push(neighbour);
      visited.push(neighbour);
      parents.set(neighbour, current);
    }
  }
  return null;
}
async function depthFirstSearch(graph, start, end) {
  let stack = [];
  let visited = [];
  let parents = new Map();
  stack.push(start);
  visited.push(start);

  while (stack.length > 0) {
    let current = stack.pop();
    if (current === end) return parents;
    let neighbours = graph.getNeighbours(current);
    for (let neighbour of neighbours) {
      if (visited.includes(neighbour)) continue;
      if (neighbour === end) return parents.set(neighbour, current);
      await sleep(sleepTime);
      neighbour.isSearching = true;
      graph.getEdge(current, neighbour).isSearching = true;
      stack.push(neighbour);
      visited.push(neighbour);
      parents.set(neighbour, current);
    }
  }
  return null;
}
async function dijkstra(graph, start, end) {
  let distance = new Map();
  let parents = new Map();

  for (let node of graph.nodes) {
    distance.set(node, Infinity);
    parents.set(node, null);
  }
  distance.set(start, 0);
  let visited = new Set();
  let list = [start];

  while (list.length > 0) {
    let current = bestNode(list, distance);
    list.splice(list.indexOf(current), 1);
    visited.add(current);
    if (current === end) return { parents, distance };
    let neighbours = graph.getNeighbours(current);
    for (let neighbour of neighbours) {
      if (visited.has(neighbour)) continue;
      await sleep(sleepTime);
      neighbour.isSearching = true;
      graph.getEdge(current, neighbour).isSearching = true;
      let newDistance =
        distance.get(current) + graph.getDistance(current, neighbour);
      if (newDistance < distance.get(neighbour)) {
        distance.set(neighbour, newDistance);
        parents.set(neighbour, current);
      }
      if (!list.includes(neighbour)) {
        list.push(neighbour);
      }
    }
  }
  return null;
}

async function prims(graph, start) {
  let unvisited = new Set(graph.nodes);
  let visited = new Set([start]);
  unvisited.delete(start);
  let MTB = new Set();

  while (unvisited.size > 0) {
    let bestEdge = await bestEdgePrims(graph, visited, unvisited);
    await sleep(sleepTime * 1.5);
    let actualEdge = graph.getEdge(bestEdge.node1, bestEdge.node2);
    actualEdge.isSearching = true;
    bestEdge.node1.isSearching = true;
    bestEdge.node2.isSearching = true;
    unvisited.delete(bestEdge.node2);
    visited.add(bestEdge.node2);
    MTB.add(bestEdge);
  }
  return MTB;
}
async function bestEdgePrims(graph, visited, unvisited) {
  let possible_edges = [];
  for (let node of visited) {
    for (let neighbour of graph.getNeighbours(node)) {
      if (unvisited.has(neighbour)) {
        const edge = new Edge(node, neighbour, graph.randomWeights);
        edge.weight = graph.getDistance(node, neighbour);
        possible_edges.push(edge);
      }
    }
  }
  if (possible_edges.length === 0) {
    alert("Graph is not connected; no edge from visited to unvisited.");
    throw new Error(
      "Graph is not connected; no edge from visited to unvisited."
    );
  }
  let best = possible_edges[0];
  for (let edge of possible_edges) {
    if (edge.weight < best.weight) best = edge;
  }
  return best;
}
function bestNode(list, distance) {
  let best = list[0];
  for (let node of list) {
    if (distance.get(node) < distance.get(best)) best = node;
  }
  return best;
}
function sleep(t) {
  return new Promise((resolve) => setTimeout(resolve, t));
}
