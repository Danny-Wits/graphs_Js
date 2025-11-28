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
