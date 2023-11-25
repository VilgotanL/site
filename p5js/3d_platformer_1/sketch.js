let unit;

// Ideas
// - Multiplayer
// - Movable boxes
// - Moving platforms
// - Conveyor belts
// - keys/locks

const PLR_SPEED = 0.1;
const PLR_JUMPPWR = 0.2;
const GRAVITY = 0.01;
let plrX, plrY, plrZ, plrXv, plrYv, plrZv;
let plrGrounded, plrDiedTime, plrCheckpoint;

let placing = null, creativeEnabled = true, flying = false;
const placeCycle = ["block", "lava", "checkpoint", "box"];


function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  unit = height*0.16;
  
  [plrX, plrY, plrZ] = [0, 1, 0];
  [plrXv, plrYv, plrZv] = [0, 0, 0];
}

function colliding(type) {
  return objs.find(obj => obj.type === type && plrX+0.5 > obj.x-obj.w/2 && plrX-0.5 < obj.x+obj.w/2 && plrY+0.5 > obj.y-obj.h/2 && plrY-0.5 < obj.y+obj.h/2 && plrZ+0.5 > obj.z-obj.d/2 && plrZ-0.5 < obj.z+obj.d/2);
}
function objColliding(self, type) {
  return objs.find(obj => obj.type === type && self.x+self.w/2 > obj.x-obj.w/2 && self.x-self.w/2 < obj.x+obj.w/2 && self.y+self.h/2 > obj.y-obj.h/2 && self.y-self.h/2 < obj.y+obj.h/2 && self.z+self.d/2 > obj.z-obj.d/2 && self.z-self.d < obj.z+obj.d/2);
}

function update() {
  let targetZv = ((keyIsDown(87)?1:0) + (keyIsDown(83)?-1:0))*PLR_SPEED;
  plrZv = (plrZv+targetZv)/2;
  let targetXv = ((keyIsDown(68)?1:0) + (keyIsDown(65)?-1:0))*PLR_SPEED;
  plrXv = (plrXv+targetXv)/2;
  
  plrYv -= GRAVITY;
  if(keyIsDown(32) && plrGrounded) plrYv = PLR_JUMPPWR;
  
  let collWith;
  plrX += plrXv;
  if(colliding("block")) {
    plrX = plrXv > 0 ? colliding("block").x-colliding("block").w/2-0.5 : colliding("block").x+colliding("block").w/2+0.5;
    plrXv = 0;
  }
  
  if(flying) plrYv = ((keyIsDown(32)?1:0) + (keyIsDown(16)?-1:0))*PLR_SPEED;
  plrY += plrYv;
  plrGrounded = colliding("block") && plrYv < 0;
  if(colliding("block")) {
    plrY = plrYv > 0 ? colliding("block").y-colliding("block").h/2-0.5 : colliding("block").y+colliding("block").h/2+0.5;
    plrYv = 0;
  }
  
  plrZ += plrZv;
  if(colliding("block")) {
    plrZ = plrZv > 0 ? colliding("block").z-colliding("block").d/2-0.5 : colliding("block").z+colliding("block").d/2+0.5;
    plrZv = 0;
  }
  
  // Boxes Y
  for(let box of objs.filter(o => o.type === "box")) {
    if(!box.yv) box.yv = 0;
    box.yv -= GRAVITY;
    box.y += box.yv;
    let grounded = box.yv < 0 && objColliding(box, "block");
    if(objColliding(box, "block")) {
      let coll = objColliding(box, "block");
      box.y = box.yv > 0 ? coll.y-coll.h/2-box.h/2 : coll.y+coll.h/2+box.h/2;
      box.yv = 0;
    }
  }
  
  // Lava and Checkpoint
  if(colliding("lava")) plrDiedTime = Date.now();
  else if(colliding("checkpoint")) {
    plrCheckpoint = colliding("checkpoint");
  }
  
  // Placing
  if(creativeEnabled) {
    if(keyIsDown("80")) { //P
      placing = { type: "block", x: Math.round(plrX), y: Math.round(plrY), z: Math.round(plrZ), w: 1, h: 1, d: 1 };
    }
  }
}

function draw() {
  if(plrDiedTime && Date.now() > plrDiedTime+1000) {
    plrDiedTime = null;
    [plrX, plrY, plrZ] = [plrCheckpoint?.x??0, plrCheckpoint?.y??1, plrCheckpoint?.z??0];
    [plrXv, plrYv, plrZv] = [0, 0, 0];
  }
  if(!plrDiedTime) update();
  background(220);
  // Gui
  
  // 3D
  scale(1, -1, -1);
  rotateX(-0.2*PI);
  
  // Player
  if(plrDiedTime) {
    let t = (Date.now()-plrDiedTime);
    fill(map(t, 0, 1000, 180, 255), map(t, 0, 1000, 180, 255), map(t, 0, 1000, 180, 255));
  }
  else fill(180);
  box(unit, unit, unit);
  
  // Level
  translate(-plrX*unit, -plrY*unit, -plrZ*unit);
  for(let obj of (placing ? [...objs, placing] : objs)) {
    if(obj.type === "block") fill(255);
    if(obj.type === "lava") fill(255, 0, 0);
    if(obj.type === "checkpoint") fill(0, 255, 0, 100);
    if(obj.type === "box") fill(255, 200, 0);
    if(obj === placing && (Date.now()/400)%1<0.5) fill(0, 0, 0, 0);
    push();
    translate(obj.x*unit, obj.y*unit, obj.z*unit);
    box(obj.w*unit, obj.h*unit, obj.d*unit);
    pop();
  }
}

function keyPressed(e) {
  if(!creativeEnabled) return;
  if(placing) {
    if(!keyIsDown(71/*G*/)) {
      e.preventDefault();
      if(key === "ArrowUp") placing.z += 1;
      if(key === "ArrowDown") placing.z -= 1;
      if(key === "ArrowRight") placing.x += 1;
      if(key === "ArrowLeft") placing.x -= 1;
      if(key === "e") placing.y += 1;
      if(key === "q") placing.y -= 1;
    } else {
      if(key === "ArrowUp") placing.d += 1, placing.z += 0.5;
      if(key === "ArrowDown") placing.d -= 1, placing.z -= 0.5;
      if(key === "ArrowRight") placing.w += 1, placing.x += 0.5;
      if(key === "ArrowLeft") placing.w -= 1, placing.x -= 0.5;
      if(key === "e") placing.h += 1, placing.y += 0.5;
      if(key === "q") placing.h -= 1, placing.y -= 0.5;
    }
    if(key === "Enter") { // Place
      placing.w = Math.abs(placing.w);
      placing.h = Math.abs(placing.h);
      placing.d = Math.abs(placing.d);
      objs.push(placing);
      placing = null;
    }
    if(key === "Backspace") placing = null;
    if(key === "h") placing.type = placeCycle[(placeCycle.indexOf(placing.type)+1)%placeCycle.length];
  }
  if(!placing && (key === "o" || key === "i")) { // Edit/Duplicate nearest
    let obj = objs.sort((a, b) => Math.hypot(a.x-plrX, a.y-plrY, a.z-plrZ) - Math.hypot(b.x-plrX, b.y-plrY, b.z-plrZ))[0];
    if(obj) {
      if(key === "o") objs.splice(objs.indexOf(obj), 1);
      placing = Object.assign({}, obj);
    }
  }
  if(key === "f") flying = !flying;
  if(key === "Y") {
    console.log(JSON.stringify(objs));
  }
}