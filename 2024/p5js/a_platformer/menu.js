




//MAIN MENU
function MainMenu(){
  this.id = "main_menu";
  
  this.playBtn = new Button(width/2-(158/2), 220, 159, 80, "Play", 80);
  this.playBtn.textXoff = -2;
  this.playBtn.textYoff = -5;
  
  
  this.update = function(){
    
    this.playBtn.update();
    if(this.playBtn.pressed == true){
      menu = null;
      lvl.loadLevel(0);
      lvl.paused = false;
      lvl.hidden = false;
    }
    
  }
  
  this.draw = function(){
    push();
    //main menu stuff
    
    //title
    strokeWeight(0);
    fill(0);
    textSize(100);
    textAlign(CENTER);
    text("A Platformer", width/2, 150);
    
    pop();
    
    this.playBtn.draw();
  }
}












//Pause menu
function PauseMenu(){
  this.id = "pause_menu";
  
  this.resumeBtn = new Button(width/2-25, 10, 50, 55, "\u25b6", 58);
  
  this.exitBtn = new Button(width/2-(332/2), 400, 332, 40,"Exit to main menu",40);
  
  this.update = function(){
    this.resumeBtn.update();
    if(this.resumeBtn.pressed == true){ //resume pressed
      lvl.paused = false;
      menu = null;
    }
    
    this.exitBtn.update();
    if(this.exitBtn.pressed == true){
      lvl.paused = true;
      lvl.hidden = true;
      menu = new MainMenu();
    }
  }
  this.draw = function(){
    push();
    //back rect
    strokeWeight(2);
    stroke(0);
    fill(220);
    rect(width/2-(350/2), 150, 350, 300);
    //pause text
    strokeWeight(0);
    fill(0);
    textAlign(CENTER);
    
    textSize(80);
    text("Paused", width/2, 250);
    
    strokeWeight(1);
    textSize(30);
    text("Level: "+lvl.name, width/2, 300);
    fill(255, 255, 0);
    stroke(255, 255, 0);
    text("Coins: "+lvl.coins, width/2, 335);
    pop();
    
    
    this.resumeBtn.draw();
    this.exitBtn.draw();
  }
}

