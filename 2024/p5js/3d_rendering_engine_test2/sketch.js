let cube;
let cam;
let canvas;

let grass;

function preload(){
  grass = loadImage("grass.png");
}

function setup() {
  canvas = createCanvas(windowWidth, windowHeight);
  cam = cam3.new();
  
  cube = mesh3.box(0.3, 0.3, 0.6);
  cube.addNewTexTriangle(grass, -1, 2, 0, 0, 0, 1, 2, 0, 1, 0, 0, 1, 0, 1, 1);
  cube.pos = vec3.new(0, 0, 1.5);
  
  grass.loadPixels();
}

function draw() {
  background(220);
  
  
  cube.rot[1] = mouseX / 100;
  cube.rot[0] = mouseY / 100;
  
  cam.startDraw();
  cam.draw(cube);
  cam.endDraw();
  
  image(grass, 0, 0, 100, 100);
}