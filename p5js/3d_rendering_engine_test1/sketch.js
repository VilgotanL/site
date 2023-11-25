let canvas;

let cam;

let mesh1;

let mesh2;

let box1;

let box2;

let groundBox;

function setup() {
  canvas = createCanvas(600, 500);
  frameRate(60);
  
  setTimeout(()=>requestPointerLock(),1000);
  
  cam = new v3d.Camera(canvas, 0,0,-3, 2, 0.1, width, height, 0,0);
  
  mesh1 = new v3d.Mesh(0, 0, 0, 0, 0);
  let t1 = new v3d.Triangle(-0.5, -0.5, 0, 0.5, 0.5, 0, -0.5, 0.5, 0);
  let t2 = new v3d.Triangle(-0.5, -0.5, 0, 0.5, -0.5, 0, 0.5, 0.5, 0);
  let t3 = new v3d.Triangle(0.5, 0.5, 0, -0.5, -0.5, 0, -0.5, 0.5, 0);
  let t4 = new v3d.Triangle(0.5, -0.5, 0, -0.5, -0.5, 0, 0.5, 0.5, 0);
  mesh1.addTriangle(t1);
  mesh1.addTriangle(t2);
  mesh1.addTriangle(t3);
  mesh1.addTriangle(t4);
  mesh1.setSurfaceColorToRandomGrayscale();
  
  box1 = v3d.createBoxMesh(0, 0.8, 0, 0.2, 0.1, 0.4);
  
  //box1.setSurfaceColor(0, 255, 0);
  box1.setSurfaceColorToRandomGrayscale();
  
  
  mesh2 = new v3d.Mesh(0, 0, 0, 0, 0);
  let mesh2t1 = new v3d.Triangle(-0.9, 0, 0, -0.74, 0, 0.1, -0.8, -0.2, 0);
  //mesh2t1.setSurfaceColor(255, 0, 0);
  mesh2t1.setSurfaceColorToRandomGrayscale();
  mesh2.addTriangle(mesh2t1);
  
  box2 = v3d.createBoxMesh(0.7, -0.7, 0, 0.25, 0.25, 1);
  box2.xRot = 0.1;
  box2.yRot = 0.2;
  //box2.setSurfaceColor(0, 150, 255);
  box2.setSurfaceColorToRandomGrayscale();
  
  groundBox = v3d.createBoxMesh(0, -1.5, 0, 2, 0.2, 2);
  //groundBox.setSurfaceColor(100, 100, 100);
  groundBox.setSurfaceColorToRandomGrayscale();
  
}

function draw() {
  background(220, 255, 220);
  
  cam.updateCameraMovement(0.05, 0.005);
  
  //mesh1.drawWireFrame(cam);
  //mesh1.drawNormalsWireFrame(cam, 0.3);
  mesh1.draw(cam);
  
  mesh1.xRot += 0.001;
  mesh1.yRot += 0.03;
  
  //box1.drawWireFrame(cam);
  //box1.drawNormalsWireFrame(cam, 0.1);
  box1.draw(cam);
  box1.yRot += 0.02;
  
  //mesh2.drawWireFrame(cam);
  //mesh2.drawNormalsWireFrame(cam, 0.3);
  mesh2.draw(cam);
  
  //box2.drawWireFrame(cam);
  //box2.drawNormalsWireFrame(cam, 0.05);
  box2.draw(cam);
  
  //groundBox.drawWireFrame(cam);
  //groundBox.drawNormalsWireFrame(cam, 0.1);
  groundBox.draw(cam);
  
}
