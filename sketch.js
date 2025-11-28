const Background = "white";
const graph = new Graph();
let selected_node = null;

function circle_circle(c1, c2) {
  let distance = dist(c1.x, c1.y, c2.x, c2.y);
  return distance < c1.radius + c2.radius ? true : false;
}

function setup() {
  createCanvas(window.innerWidth, window.innerHeight);
  let canvas = document.querySelector("canvas");
  canvas.oncontextmenu = (e) => {
    e.preventDefault(); // Prevent default browser menu
    return false; // Stop further handling
  };
}

function windowResized() {
  resizeCanvas(window.innerWidth, window.innerHeight);
}
function draw() {
  background(Background);
  graph.draw();
}
let i = 0;
function mousePressed() {
  if (mouseButton === RIGHT) {
    graph.add(new Node(mouseX, mouseY, i, 0));
    i++;
  }
  if (mouseButton === LEFT) {
    let mouse = { x: mouseX, y: mouseY, radius: 10 };
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
function dijkstaStart() {
  if (selected_node === null) return;
  let { distances, previous } = dijkstra(graph, selected_node.value);
  console.log(distances, previous);
}

function keyPressed() {
  if (key === "d") {
    if (selected_node) {
      graph.remove(selected_node);
    }
  }
  if (key === "n") {
    if (selected_node) {
      let neighbours = graph.getNeighbours(selected_node);
      neighbours.forEach((neighbour) => {
        neighbour.isNeighbour = true;
      });
      setTimeout(() => {
        neighbours.forEach((neighbour) => {
          neighbour.isNeighbour = false;
        });
      }, 1000);
    }
  }
}
