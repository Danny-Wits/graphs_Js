const Background = "white";
let graph = new Graph(true, 0.9, true);
let selected_node = null;
let start_node = null;
let target_node = null;
const init_node_count = 1;
let i = 1;
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

function setup() {
  createCanvas(window.innerWidth, window.innerHeight);
  let canvas = document.querySelector("canvas");
  canvas.oncontextmenu = (e) => {
    e.preventDefault();
    return false;
  };
  for (; i < init_node_count; i++) {
    graph.add(
      new Node(random(100, width - 100), random(200, height - 200), i, 0)
    );
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

function mousePressed() {
  if (mouseButton === RIGHT) {
    graph.add(new Node(mouseX, mouseY, i, 0));
    i++;
  }
  if (mouseButton === LEFT) {
    let mouse = { x: mouseX, y: mouseY, radius: 2 };
    let found = false;
    graph.nodes.forEach((node) => {
      if (circle_circle(node, mouse)) {
        selected_node = node;
        found = true;
        node.isSelected = true;
      } else {
        node.isSelected = false;
      }
    });
    if (!found) {
      selected_node = null;
    }
  }
}
function mouseDragged() {
  if (selected_node && mouseButton === LEFT) {
    selected_node.x = mouseX;
    selected_node.y = mouseY;
  }
}
function keyPressed() {
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
    start_node = selected_node;
    start_node.isStart = true;
  }
  if (key === "t") {
    if (target_node) target_node.isTarget = false;
    target_node = selected_node;
    target_node.isTarget = true;
  }
}

function setAnimationSpeed(speed) {
  sleepTime = map(speed, 1, 10, 1000, 1);
  console.log(sleepTime);
}

//! Algo calls
async function start_bfs() {
  graph.searchCleanUp();
  if (!start_node || !target_node) return;
  let parents = await breadthFirstSearch(graph, start_node, target_node);
  graph.searchCleanUp();
  await parsePath(parents);
}
async function start_dfs() {
  graph.searchCleanUp();
  if (!start_node || !target_node) return;
  let parents = await depthFirstSearch(graph, start_node, target_node);
  graph.searchCleanUp();
  await parsePath(parents);
}
async function start_dijkstra() {
  graph.searchCleanUp();
  if (!start_node || !target_node) return;
  let { parents, distance } = await dijkstra(graph, start_node, target_node);
  graph.searchCleanUp();
  console.table(distance);
  await parsePath(parents);
}

async function parsePath(parents) {
  if (parents) {
    let t = target_node;
    while (parents.get(t)) {
      let edge = graph.getEdge(parents.get(t), t);
      await sleep(sleepTime * 1.5);
      edge.isPath = true;
      t.isPath = true;
      t = parents.get(t);
    }
    t.isPath = true;
  }
}
