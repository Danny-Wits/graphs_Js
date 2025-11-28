function randomColor() {
  return color(random(200), random(200), random(200), random(100, 200));
}
class Node {
  radius = 50;
  constructor(x, y, value) {
    this.x = x;
    this.y = y;
    this.value = value;
    this.color = randomColor();
    this.isSelected = false;
  }
  draw() {
    noStroke();
    fill(this.color);
    circle(this.x, this.y, this.isSelected ? this.radius * 1.2 : this.radius);
    fill(0);
    textSize(16);
    let width = textWidth(this.value);
    text(this.value, this.x - width / 2, this.y + 5);
  }
}
class Edge {
  constructor(node1, node2, randomWeights = false) {
    this.node1 = node1;
    this.node2 = node2;
    this.color = color(0, 10);
    this.randomWeights = randomWeights;
    this.randomWeight = round(random(10, 30), 0);
  }
  draw() {
    this.distance = this.randomWeights ? this.randomWeight : this.getDistance();
    let midpoint = this.getMidpoint();
    stroke(this.color);
    strokeWeight(2);
    line(this.node1.x, this.node1.y, this.node2.x, this.node2.y);
    fill(this.color);
    rect(midpoint.x - 12, midpoint.y - 12, 24, 24);
    fill(0);
    textSize(16);
    let width = textWidth(this.distance);
    text(this.distance, midpoint.x - width / 2, midpoint.y + 5);
  }
  getDistance() {
    return round(Graph.getCartesianDistance(this.node1, this.node2), 0);
  }
  getMidpoint() {
    return {
      x: (this.node1.x + this.node2.x) / 2,
      y: (this.node1.y + this.node2.y) / 2,
    };
  }
}
class Graph {
  static getCartesianDistance(node1, node2) {
    return dist(node1.x, node1.y, node2.x, node2.y) / 10;
  }
  constructor(ramdomWeights = false) {
    this.nodes = [];
    this.edges = [];
    this.randomWeights = ramdomWeights;
  }
  add(node) {
    this.nodes.forEach((otherNode) => {
      if (random(0, 1) > 0.5) return;
      this.edges.push(new Edge(node, otherNode, this.randomWeights));
    });
    this.nodes.push(node);
    console.log(this.nodes, this.edges);
  }
  draw() {
    this.nodes.forEach((node) => {
      node.draw();
    });
    this.edges.forEach((edge) => {
      edge.draw();
    });
  }
  getEdge(node1, node2) {
    return this.edges.find(
      (edge) => edge.node1 === node1 && edge.node2 === node2
    );
  }
  getDistance(node1, node2) {
    let edge = this.getEdge(node1, node2);
    if (!edge) return null;
    return edge.distance;
  }
  getNeighbours(node) {
    let neighbours = [];
    this.edges.forEach((edge) => {
      if (edge.node1 === node) neighbours.push(edge.node2);
      if (edge.node2 === node) neighbours.push(edge.node1);
    });
    return neighbours;
  }
}

function dijkstra(graph, start) {
  let distances = {};
  let previous = {};
  let visited = [];
  for (let vertex in graph.nodes) {
    distances[vertex] = vertex === start ? 0 : Infinity;
    previous[vertex] = null;
  }

  while (visited.length < graph.nodes.length) {
    let bestNode = minDistance(distances, graph.nodes);

    for (let neighbor in graph.getNeighbours(bestNode)) {
      if (visited.includes(neighbor)) continue;
      visited.push(bestNode);
      print(visited);
      let edge = graph.getEdge(bestNode, neighbor);
      if (!edge) continue;
      let newDistance = distances[bestNode] + edge.distance;
      if (newDistance < distances[neighbor]) {
        distances[neighbor] = newDistance;
        previous[neighbor] = bestNode;
      }
    }
  }
  return { distances, previous };
}
function minDistance(distances, nodes) {
  let min = Infinity;
  let minNode = null;
  for (let node of nodes) {
    if (distances[node] <= min) {
      min = distances[node];
      minNode = node;
    }
  }
  return minNode;
}
