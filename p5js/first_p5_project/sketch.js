//my first sketch with p5.js, a car
function setup() {
  createCanvas(400, 300);
}

function draw() {
  background(0, 200, 255);

  //ground rectangle
  fill(150, 0, 0);
  stroke(0, 240, 0);
  strokeWeight(20);
  rect(-10, 240, 420, 200);

  //chassi
  fill(255, 0, 0);
  noStroke();
  //bottom
  rect(75, 160, 250, 50);
  //top
  quad(150, 110, 250, 110, 280, 160, 120, 160); //i dont need to use quad but i didnt have the windows at the time

  //wheels
  fill(120);
  stroke(80);
  strokeWeight(4);
  //left
  circle(125, 210, 50);
  //right
  circle(275, 210, 50);

  //windows
  stroke(0, 120, 255);
  fill(0, 150, 255);
  noStroke();
  //left window
  triangle(150, 160, 120, 160, 150, 110);
  //right window
  triangle(280, 160, 250, 160, 250, 110);

  //headlight
  noStroke();
  fill(240, 240, 0);
  arc(75, 175, 20, 20, HALF_PI, -HALF_PI);
}
