const W = 10;
const H = 40;
let UPDATE_T = 500;
const UPDATE_T_f = (lines) => 500 / (1 + lines*0.1);

if(W%2!=0 || H%2!=0) throw new Error("non-even w or h");

let field = Array(H).fill(0).map(_ => Array(W).fill(""));
let pieceName;
let piece = null;
let pieceX, pieceY;
let lines = 0, score = 0;

const COLORS = {
  I: [0, 255, 255],
  O: [255, 255, 0],
  T: [200, 0, 255],
  S: [0, 255, 0],
  Z: [255, 0, 0],
  J: [0, 0, 255],
  L: [255, 100, 0],
};
const SHAPES = {
  I: [
    ["", "", "", ""],
    ["I", "I", "I", "I"],
    ["", "", "", ""],
    ["", "", "", ""],
  ],
  J: [
    ["J", "", ""],
    ["J", "J", "J"],
    ["", "", ""],
  ],
  L: [
    ["", "", "L"],
    ["L", "L", "L"],
    ["", "", ""],
  ],
  O: [
    ["O", "O"],
    ["O", "O"],
  ],
  S: [
    ["", "S", "S"],
    ["S", "S", ""],
    ["", "", ""],
  ],
  T: [
    ["", "T", ""],
    ["T", "T", "T"],
    ["", "", ""],
  ],
  Z: [
    ["Z", "Z", ""],
    ["", "Z", "Z"],
    ["", "", ""],
  ],
};

function setup() {
  createCanvas(windowWidth, windowHeight);
  nextPiece();
  nextUpdate = Date.now()+UPDATE_T;
}
const coordX = x => (s => width/2-W/2*s+x*s)(height/(H/2+1));
const coordY = y => (s => 5+(y-H/2)*s)(height/(H/2+1));
let nextPieces = ["I", "I", "S", "S", "S", "S", "T"];
function nextPiece() {
  while(nextPieces.length < 2) {
    nextPieces.push(...shuffle(["I", "O", "T", "S", "Z", "J", "L"], false));
  }
  pieceName = nextPieces.shift();
  //pieceName = "I";
  piece = SHAPES[pieceName];
  pieceX = Math.floor(W/2-piece[0].length/2);
  pieceY = H/2-2;
}
function isColl() {
  for(let ry=0; ry<piece.length; ry++) {
    for(let rx=0; rx<piece[0].length; rx++) {
      if(piece[ry][rx] && (pieceX+rx<0 || pieceY+ry<0 || pieceX+rx>=W || pieceY+ry>=H) || piece[ry][rx] && field[pieceY+ry][pieceX+rx]) {
        return true;
      }
    }
  }
  return false;
}

let nextUpdate;

let prevLeft, prevRight, prevUp, prevDown;
let prevP, paused = false;
function draw() {
  background(255);
  
  let kP = keyIsDown(80);
  if(kP && !prevP) paused = !paused;
  prevP = kP;
  if(paused) return;
  
  let kLeft = keyIsDown(37);
  let kRight = keyIsDown(39);
  let kUp = keyIsDown(38);
  let kDown = keyIsDown(40);
  let spaceDown = keyIsDown(32);
  if(kLeft && !prevLeft) {
    pieceX--;
    if(isColl()) pieceX++;
  }
  if(kRight && !prevRight) {
    pieceX++;
    if(isColl()) pieceX--;
  }
  if(kDown || spaceDown) {
    // If next piece is collision then 1*UPD_T
    pieceY++;
    if(!isColl()) nextUpdate = Math.min(nextUpdate, Date.now()+(spaceDown ? 0 : 10));
    else nextUpdate = Math.min(nextUpdate, Date.now()+1*UPDATE_T);
    pieceY--;
  }
  if(kUp && !prevUp) {
    let oldPiece = piece;
    let newPiece = piece.map(a => a.slice());
    for(let ry=0; ry<piece.length; ry++) {
      for(let rx=0; rx<piece[0].length; rx++) {
        newPiece[rx][piece.length-1-ry] = piece[ry][rx];
      }
    }
    piece = newPiece;
    if(isColl()) piece = oldPiece;
  }
  prevLeft = kLeft;
  prevRight = kRight;
  prevUp = kUp;
  prevDown = kDown;
  
  if(Date.now() >= nextUpdate) {
    pieceY++;
    if(isColl()) {
      pieceY--;
      // Place piece
      for(let ry=0; ry<piece.length; ry++) {
        for(let rx=0; rx<piece[0].length; rx++) {
          if(piece[ry][rx])
            field[pieceY+ry][pieceX+rx] = piece[ry][rx];
        }
      }
      // Check rows for all
      for(let y=H-1; y>=0; y--) {
        while(field[y].every(block => block)) {
          lines++;
          UPDATE_T = UPDATE_T_f(lines);
          field.splice(y, 1);
          field.unshift(Array(W).fill(""));
        }
      }
      nextPiece();
    }
    
    // Check if next will be collision
    pieceY++;
    if(isColl()) nextUpdate = Date.now() + 2*UPDATE_T;
    else nextUpdate = Date.now() + UPDATE_T;
    pieceY--;
  }
  
  let s = height/(H/2+1);
  strokeWeight(s*0.18);
  stroke(0);
  
  // Shadow Piece
  let origY = pieceY;
  while(!isColl()) pieceY++;
  pieceY--;
  noStroke();
  fill(200);
  for(let ry=0; ry<piece.length; ry++) {
    for(let rx=0; rx<piece[0].length; rx++) {
      if(piece[ry][rx]) {
        rect(coordX(pieceX+rx), coordY(pieceY+ry), s, s);
      }
    }
  }
  pieceY = origY;
  // Field
  stroke(0);
  for(let y=0; y<H; y++) {
    for(let x=0; x<W; x++) {
      if(field[y][x]) {
        fill(...COLORS[field[y][x]]);
        rect(coordX(x), coordY(y), s, s);
      }
    }
  }
  // Piece
  stroke(0);
  fill(...COLORS[pieceName]);
  for(let ry=0; ry<piece.length; ry++) {
    for(let rx=0; rx<piece[0].length; rx++) {
      if(piece[ry][rx]) {
        rect(coordX(pieceX+rx), coordY(pieceY+ry), s, s);
      }
    }
  }
  
  // Boundaries
  noFill();
  rect(coordX(0), coordY(0), W*s, H*s);
  
  // Score
  noStroke();
  textSize(20);
  fill(0);
  textFont("Verdana");
  textAlign(CENTER);
  text("Lines: "+lines+"\nScore: "+score, width*0.84, height*0.4);
}