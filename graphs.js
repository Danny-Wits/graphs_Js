let sleepTime = 100;
function randomColor() {
  return color(random(100, 200), random(100, 200), 255, 150);
}

class Node {
  radius = 25;
  COLORS = {
    neighbour: color(255, 0, 0, 50),
    start: color(23, 127, 219),
    target: color(100, 0, 255),
    searching: color(0, 0, 255, 100),
    path: color(170, 255, 80, 200),
  };
  constructor(x, y, value) {
    this.x = x;
    this.y = y;
    this.value = value;
    this.color = randomColor();
    this.isSelected = false;
    this.isNeighbour = false;
    this.isStart = false;
    this.isTarget = false;
    this.isSearching = false;
    this.isPath = false;
  }
  highlight() {
    this.color = color(255, 0, 0, 50);
    this.isNeighbour = true;
    setTimeout(() => {
      this.color = randomColor();
      this.isNeighbour = false;
    }, 2000);
  }
  draw() {
    noStroke();
    fill(this.color);
    if (this.isSelected) stroke(0);
    if (this.isNeighbour) fill(this.COLORS.neighbour), stroke(255, 0, 0);
    if (this.isStart) stroke(this.COLORS.start), strokeWeight(4);
    if (this.isTarget) stroke(this.COLORS.target), strokeWeight(4);
    if (this.isSearching) fill(this.COLORS.searching);
    if (this.isPath) fill(this.COLORS.path);
    circle(this.x, this.y, this.radius * 2);
    noStroke();
    strokeWeight(2);
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
    this.color = lerpColor(node1.color, node2.color, 0.5);
    this.color.setAlpha(50);
    this.randomWeights = randomWeights;
    this.randomWeight = round(random(1, 50), 0);
    this.isSearching = false;
    this.isPath = false;
  }
  highlight() {
    this.color = color(255, 0, 0, 50);
    setTimeout(() => {
      this.color = color(0, 25);
    }, 2000);
  }
  draw() {
    this.distance = this.randomWeights ? this.randomWeight : this.getDistance();
    let midpoint = this.getMidpoint();
    stroke(this.color);
    fill(this.color);
    strokeWeight(2);
    if (this.isSearching) stroke(0, 0, 255, 100), fill(0, 0, 255, 100);
    if (this.isPath) stroke(170, 255, 80, 200), fill(170, 255, 80, 100);
    line(this.node1.x, this.node1.y, this.node2.x, this.node2.y);
    rect(midpoint.x - 12, midpoint.y - 12, 24, 24, 5);
    fill(0);
    textSize(10);
    let width = textWidth(this.distance);
    text(this.distance, midpoint.x - width / 2, midpoint.y + 3);
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
  constructor(ramdomWeights = false, density = 0.5, tree = false) {
    this.nodes = [];
    this.edges = [];
    this.randomWeights = ramdomWeights;
    this.density = density;
    this.tree = tree;
  }
  add(node) {
    this.nodes.forEach((otherNode) => {
      if (this.tree) {
        if (Graph.getCartesianDistance(node, otherNode) > 5) return;
        this.edges.push(new Edge(node, otherNode, this.randomWeights));
        return;
      }
      if (random(0, 1) > this.density) return;
      this.edges.push(new Edge(node, otherNode, this.randomWeights));
    });
    this.nodes.push(node);
  }
  remove(node) {
    this.nodes = this.nodes.filter((n) => n !== node);
    this.edges = this.edges.filter(
      (edge) => edge.node1 !== node && edge.node2 !== node
    );
  }
  draw() {
    this.edges.forEach((edge) => {
      edge.draw();
    });
    this.nodes.forEach((node) => {
      node.draw();
    });
  }
  getEdge(node1, node2) {
    return this.edges.find(
      (edge) =>
        (edge.node1 === node1 && edge.node2 === node2) ||
        (edge.node1 === node2 && edge.node2 === node1)
    );
  }
  getDistance(node1, node2) {
    let edge = this.getEdge(node1, node2);
    if (!edge) return Infinity;
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
  getDegree() {
    let degree = 0;
    this.edges.forEach((_edge) => {
      degree += 2;
    });
    return degree;
  }
  getOrder() {
    return this.nodes.length;
  }
  searchCleanUp() {
    this.nodes.forEach((node) => {
      node.isSearching = false;
      node.isPath = false;
    });
    this.edges.forEach((edge) => {
      edge.isSearching = false;
      edge.isPath = false;
    });
  }
  loadOldGraph(oldGraph) {
    console.log(oldGraph);

    for (let i = 0; i < oldGraph.nodes.length; i++) {
      let n = oldGraph.nodes[i];
      let n1 = new Node(n.x, n.y, n.value, 0);
      this.nodes.push(n1);
    }
    for (let e of oldGraph.edges) {
      let n1 = this.nodes.find((n) => n.value === e.node1.value);
      let n2 = this.nodes.find((n) => n.value === e.node2.value);
      let e1 = new Edge(n1, n2, e.randomWeights);
      e1.randomWeight = e.randomWeight;
      this.edges.push(e1);
    }
  }
}
