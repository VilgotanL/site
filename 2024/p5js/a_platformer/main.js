var lvl;

var menu = null;



function setup() {
  createCanvas(1280, 720);
  
  lvl = new Level();
  //lvl.loadLevel(0); //load debug level
  
  menu = new MainMenu();
}

function draw() {
  background(220);
  
  
  lvl.update();
  lvl.draw();
  lvl.drawGui();
  
  
  if(menu){
    menu.draw();
    menu.update();
  }
}