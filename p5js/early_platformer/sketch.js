let mainPlr = new Player(50, 50, 0.4, 3, 10);

let currentLevelGroundArray = [];

let placePlatformStartX;
let placePlatformStartY;
let mousePrevPressed = false;

function Player(sizeX, sizeY, gravity, moveSpeed, jumpPower){
  this.xPos = 0;
  this.yPos = 0;
  this.xSize = sizeX;
  this.ySize = sizeY;
  
  this.gravity = gravity;
  this.xVel = 0;
  this.yVel = 0;
  this.moveSpeed = moveSpeed;
  this.jumpPower = jumpPower;
  
  this.currentLevelArray = [ [],[],[],[] ];
  
  this.loadLevel = function(levelArray){
    this.currentLevelArray = levelArray;
    
    this.xPos = levelArray[0][0];
    this.yPos = levelArray[0][1];
    
    this.xVel = 0;
    this.yVel = 0;
  }
  
  this.isCollidingWithGrounds = function(groundArray){
    let colliding = false;
    
    for(let currentGround of groundArray){
      if(this.yPos+this.ySize > currentGround.yPos && 
        this.yPos < currentGround.yPos + currentGround.ySize &&
        this.xPos + this.xSize > currentGround.xPos &&
        this.xPos < currentGround.xPos + currentGround.xSize){ //currently only checks plr bottom
        colliding = true;
      }
    }
    
    return colliding;
  }
  this.keyPressed = function(){
    //horizontal movement
    if(keyIsDown(65) && (!keyIsDown(68))){
      this.xVel = -this.moveSpeed;
    }else if(keyIsDown(68) && (!keyIsDown(65))){
      this.xVel = this.moveSpeed;
    }else{
      this.xVel = 0;
    }
    //vertical movement / jump
    if(keyIsDown(87)){
      //check if on ground
      this.yPos += 1;
      if(this.isCollidingWithGrounds(this.currentLevelArray[2])){
        this.yVel = -this.jumpPower;
      }
      this.yPos -= 1;
    }
  }
  this.update = function(groundArray){
    
    this.yVel += this.gravity;
    
    //x collision check
    this.xPos += this.xVel;
    if(this.isCollidingWithGrounds(this.currentLevelArray[2])){
      while(this.isCollidingWithGrounds(this.currentLevelArray[2])){
        if(this.xVel > 0){
          this.xPos -= 1;
        }else{
          this.xPos += 1;
        }
      }
      this.xVel = 0;
    }
    //y collision check
    this.yPos += this.yVel;
    if(this.isCollidingWithGrounds(this.currentLevelArray[2])){
      while(this.isCollidingWithGrounds(this.currentLevelArray[2])){
        if(this.yVel > 0){
          this.yPos -= 1;
        }else{
          this.yPos += 1;
        }
      }
      this.yVel = 0;
    }
    
    //deadly collision check
    if(this.isCollidingWithGrounds(this.currentLevelArray[3])){
      this.loadLevel(this.currentLevelArray);
    }
    //goal collision check
    if(this.isCollidingWithGrounds(this.currentLevelArray[1])){
      console.log("You won!");
      this.loadLevel(this.currentLevelArray);
    }
  }
  this.draw = function(){
    strokeWeight(2);
    stroke(0);
    fill(0, 200, 0);
    rect(this.xPos, this.yPos, this.xSize, this.ySize);
  }
}

function LevelBox(xPos, yPos, xSize, ySize, boxType){
  this.xPos = xPos;
  this.yPos = yPos;
  this.xSize = xSize;
  this.ySize = ySize;
  this.boxType = boxType;
  
  this.draw = function(){
    strokeWeight(2);
    stroke(0);
    if(boxType === "Solid"){
      fill(100);
    }else if(boxType === "Goal"){
      fill(0, 255, 0);
    }else if(boxType === "Deadly"){
      fill(255, 0, 0);
    }else{
      fill(0, 0, 0);
    }
    rect(this.xPos, this.yPos, this.xSize, this.ySize);
  }
}

function setup() {
  createCanvas(640, 420);
  
  currentLevelArray = [ //level
    [//level data
      //plr start pos
      300, 200
    ],
    [//flag/finish
      new LevelBox(10, 100, 50, 50, "Goal")
    ],
    [//solid ground
      new LevelBox(50, 350, 550, 100, "Solid"),//ground
      new LevelBox(400, 250, 50, 100, "Solid"),//right box
      new LevelBox(500, 150, 100, 50, "Solid"),//floating box
      new LevelBox(300, 100, 100, 50, "Solid"),//floating box 2
      new LevelBox(0, 150, 100, 50, "Solid"),//floating box 3
      new LevelBox(0, 50, 10, 100, "Solid")//floating box 3.5
    ],
    [//deadly stuff
      new LevelBox(50, 300, 225, 50, "Deadly"),
      new LevelBox(450, 300, 150, 50, "Deadly")
    ]
  ];
  
  mainPlr.loadLevel(currentLevelArray);
}

function draw() {
  background(220);
  
  for(let i = 1; i < currentLevelArray.length; i++){
    for(let currentLevelBox of currentLevelArray[i]){
      currentLevelBox.draw();
    }
  }
  
  mainPlr.keyPressed();
  mainPlr.update();
  mainPlr.draw();
  
  //place platforms
  //if(mouseIsPressed){
  //  if(!mousePrevPressed){
  //    placePlatformStartX = mouseX;
  //    placePlatformStartY = mouseY;
  //  }
  //  mousePrevPressed = true;
  //}else{
  //  if(mousePrevPressed){
  //    currentLevelArray[1].push(new LevelBox(placePlatformStartX, placePlatformStartY, mouseX-placePlatformStartX, mouseY-placePlatformStartY, "Solid"));
  //  }
  //  mousePrevPressed = false;
  //}
}
