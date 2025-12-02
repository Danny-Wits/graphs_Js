const Background = "white";
let graph = new Graph(true, 0.9, true);
let selected_node = null;
let start_node = null;
let target_node = null;
const init_node_count = 1;
let i = 1;
let canvas;
//!Saves
window.addEventListener("beforeunload", () => {
  saveGraph();
});
function saveGraph() {
  localStorage.setItem("graph", JSON.stringify(graph));
}
function clearSave() {
  let confirmation = confirm("Are you sure you want to clear the save file?");
  if (!confirmation) return;
  graph = new Graph(graph.randomWeights, graph.density, graph.tree);
  localStorage.removeItem("graph");
  selected_node = null;
  target_node = null;
  start_node = null;
  i = 1;
}
// !Load
window.onload = () => {
  let oldGraph = JSON.parse(localStorage.getItem("graph"));
  if (!oldGraph) return;
  console.log(oldGraph);
  graph = new Graph(oldGraph.randomWeights, oldGraph.density, oldGraph.tree);
  graph.loadOldGraph(oldGraph);
  i = graph.nodes.length + 1;
};
function circle_circle(c1, c2) {
  let distance = dist(c1.x, c1.y, c2.x, c2.y);
  return distance < c1.radius + c2.radius ? true : false;
}
function createNode() {
  graph.add(new Node(random(100, width - 100), random(200, height - 200), i));
  i += 1;
}
function setup() {
  createCanvas(window.innerWidth, window.innerHeight);
  canvas = document.querySelector("canvas");
  canvas.oncontextmenu = (e) => {
    e.preventDefault();
    return false;
  };
  canvas.style.zIndex = 10;
  for (; i < init_node_count; i++) {
    graph.add(new Node(random(100, width - 100), random(200, height - 200), i));
  }
}

function windowResized() {
  resizeCanvas(window.innerWidth, window.innerHeight);
}
function draw() {
  background(Background);
  sideBox();
  graph.draw();
}
function sideBox() {
  let offset = 100;
  if (selected_node) {
    drawNode(selected_node, { x: width - offset, y: 100 }, "Selected Node");
  }
  if (start_node) {
    drawNode(start_node, { x: width - offset, y: 200 }, "Start Node");
  }
  if (target_node) {
    drawNode(target_node, { x: width - offset, y: 300 }, "Target Node");
  }
}
function drawNode(node, position, name) {
  if (width < 500) return;

  let twidth = textWidth(name);
  text(name, position.x - twidth / 2, position.y + 50);
  fill(node.color);
  stroke(0);
  circle(position.x, position.y, node.radius * 2);
  noStroke();
  fill(0);
  textSize(16);
  twidth = textWidth(node.value);
  text(node.value, position.x - twidth / 2, position.y + 5);
}

//!INPUTS

async function mousePressed() {
  if (mouseButton === RIGHT) {
    graph.add(new Node(mouseX, mouseY, i, 0));
    i++;
  }
  if (mouseButton === LEFT) {
    let mouse = { x: mouseX, y: mouseY, radius: 2 };
    graph.nodes.forEach((node) => {
      if (circle_circle(node, mouse)) {
        selected_node = node;
        node.isSelected = true;
      } else {
        node.isSelected = false;
      }
    });
  }
}
function mouseDragged() {
  if (selected_node && mouseButton === LEFT) {
    selected_node.x = mouseX;
    selected_node.y = mouseY;
  }
}
function keyPressed() {
  if (key === "h") {
    graph.toggleEdges();
  }
  if (!selected_node) return;
  if (key === "d") {
    graph.remove(selected_node);
  }
  if (key === "n") {
    graph.searchCleanUp();
    let neighbours = graph.getNeighbours(selected_node);
    neighbours.forEach((neighbour) => {
      neighbour.highlight();
    });
    graph.edges.forEach((edge) => {
      if (edge.node1 === selected_node || edge.node2 === selected_node) {
        edge.highlight();
      }
    });
  }
  if (key === "s") {
    if (start_node) start_node.isStart = false;
    if (start_node == selected_node) {
      start_node = null;
      return;
    }
    start_node = selected_node;
    start_node.isStart = true;
    start_node.isPath = false;
  }
  if (key === "t") {
    if (target_node) target_node.isTarget = false;
    if (target_node == selected_node) {
      target_node = null;
      return;
    }
    target_node = selected_node;
    target_node.isTarget = true;
    target_node.isPath = false;
  }
}

function setAnimationSpeed(speed) {
  sleepTime = map(speed, 1, 10, 1000, 1);
  console.log(sleepTime);
}

//! Algo calls
async function start_bfs() {
  toggleControls();
  graph.searchCleanUp();
  if (!start_node || !target_node) return;
  let parents = await breadthFirstSearch(graph, start_node, target_node);
  graph.searchCleanUp();
  await parsePath(parents);
}
async function start_dfs() {
  toggleControls();
  graph.searchCleanUp();
  if (!start_node || !target_node) return;
  let parents = await depthFirstSearch(graph, start_node, target_node);
  graph.searchCleanUp();
  await parsePath(parents);
}
async function start_dijkstra() {
  toggleControls();
  graph.searchCleanUp();
  if (!start_node || !target_node) return;
  let { parents, distance } = await dijkstra(graph, start_node, target_node);
  graph.searchCleanUp();
  console.table(distance);
  await parsePath(parents);
}
async function start_prims() {
  toggleControls();
  graph.searchCleanUp();
  if (!start_node) return;
  let MST = await prims(graph, start_node);
  graph.searchCleanUp();
  await parsePathPrims(MST, start_node);
}
async function parsePath(parents) {
  if (parents) {
    let t = target_node;
    let length = 0;
    while (parents.get(t)) {
      let edge = graph.getEdge(parents.get(t), t);
      await sleep(sleepTime * 1.5);
      edge.isPath = true;
      t.isPath = true;
      t = parents.get(t);
      length += edge.distance;
    }
    t.isPath = true;
    t.showText("Path Length: " + round(length, 0));
  }
}
async function parsePathPrims(MST, start) {
  if (MST) {
    let weight = 0;
    for (let edge of MST) {
      await sleep(sleepTime * 1.5);
      let actualEdge = graph.getEdge(edge.node1, edge.node2);
      actualEdge.isPath = true;
      actualEdge.node1.isPath = true;
      actualEdge.node2.isPath = true;
      weight += actualEdge.distance;
    }
    start.showText("MST Weight: " + round(weight, 0));
  }
}

function press_key(key) {
  canvas.dispatchEvent(
    new KeyboardEvent("keydown", {
      key: key,
      code: "Key" + key,
      bubbles: true,
      cancelable: true,
    })
  );
  canvas.dispatchEvent(
    new KeyboardEvent("keyup", {
      key: key,
      code: "Key" + key,
      bubbles: true,
      cancelable: true,
    })
  );
}

function toggleControls() {
  if (width > 800) return;
  if (document.querySelector(".controls").style.display === "none") {
    document.querySelector(".controls").style.display = "block";
  } else {
    document.querySelector(".controls").style.display = "none";
  }
}
