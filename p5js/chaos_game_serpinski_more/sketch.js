let sides = 3;
let points = [];
function updatePoints(){
  points = [];
  for(let i=0; i<sides; i++){
    points.push([
      (Math.sin((Math.PI*2 / sides * i))) * 250 + 300,
      -((Math.cos((Math.PI*2 / sides * i))) * 250) + 300
    ]);
  }
}
updatePoints();

let currX = points[0][0];
let currY = points[0][1];

let iterationsPerFrame = 100;
let strokeW = 2.0;

let sidesSlider;
let sidesP;
let iterSlider;
let strokeWSlider;
let iterP;
let strokeWP;
let updateBtn;

function getHalfInbetween(x, y){
  return (x+y)/2;
}

function setup() {
  createCanvas(600, 600);
  background(255);
  
  createP("iterations per frame:");
  iterP = createP(iterationsPerFrame);
  iterSlider = createSlider(1, 1000, iterationsPerFrame);
  createDiv(""); //works like a line break but easier in this case
  createP("point size:");
  strokeWP = createP(strokeW);
  strokeWSlider = createSlider(0.1, 9.9, strokeW, 0.1);
  createDiv(""); //works like a line break but easier in this case
  createP("amount of points in shape:");
  sidesP = createP(sides);
  sidesSlider = createSlider(1, 12, sides);
  createDiv(""); //works like a line break but easier in this case
  updateBtn = createButton("Redraw With Changes");
  
  updateBtn.mousePressed(function(){
    strokeW = strokeWSlider.value();
    iterationsPerFrame = iterSlider.value();
    sides = sidesSlider.value();
    updatePoints();
    background(255);
  });
}

function draw() {
  iterP.html(("0000"+iterSlider.value()).slice(-4));
  strokeWP.html((Math.floor(strokeWSlider.value())==strokeWSlider.value()?strokeWSlider.value()+".0":strokeWSlider.value()));
  sidesP.html(("0"+sidesSlider.value()).slice(-2));
  
  stroke(0);
  strokeWeight(strokeW);
  
  for(let i=0; i<iterationsPerFrame; i++){
    let randomPoint = random(points);
    let rpX = randomPoint[0];
    let rpY = randomPoint[1];

    let newCurrX = getHalfInbetween(rpX, currX);
    let newCurrY = getHalfInbetween(rpY, currY);

    currX = newCurrX;
    currY = newCurrY;

    point(currX, currY);
  }
  
  //draw points for debug
  /*strokeWeight(25);
  stroke(0, 255, 0);
  for(let i=0; i<points.length; i++){
    point(points[i][0], points[i][1]);
  }*/
}