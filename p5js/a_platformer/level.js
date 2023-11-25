//level


function Level(){
  this.id = "-1";
  this.objs = [];
  this.plr = new Player(this);
  this.name = "Not_Loaded_Level";
  
  this.coins = 0;
  
  this.pauseBtn = new Button(width/2-25, 10, 50, 55, "II", 60);
  
  this.paused = true;
  this.hidden = true;
  
  
  this.update = function(){
    if(this.paused){
      return;
    }
    
    //update objects
    for(let i=0; i<this.objs.length; i++){
      this.objs[i].update(this);
    }
    //update player
    this.plr.update();
  }
  
  this.draw = function(){
    if(this.hidden){
      return;
    }
    
    //draw objects
    for(let i=0; i<this.objs.length; i++){
      let xOff = width/2-this.plr.w/2 - this.plr.x;
      let yOff = height/2-this.plr.w/2 - this.plr.y;
      this.objs[i].draw(xOff, yOff);
    }
    //draw player
    if(!this.paused){
      this.plr.draw();
    }
    
  }
  this.drawGui = function(){
    if(this.paused){
      return;
    }
    
    //pause button
    this.pauseBtn.update();
    if(this.pauseBtn.pressed == true || keyIsDown(27)){ //pause pressed or ESC
      menu = new PauseMenu();
      this.paused = true;
    }
    this.pauseBtn.draw();
    
  }
  
  this.loadLevel = function(lvlId){
    let level = levels[lvlId];
    
    if(level){
      this.id = lvlId;
      this.name = level.name;
      this.objs = [];
      this.coins = 0;
      this.plr = new Player(this);
      this.plr.x = level.startX || 0;
      this.plr.y = level.startY || 0;
      
      for(let i=0; i<level.objects.length; i++){
        let obj = level.objects[i];
        this.objs.push(new Obj(
          obj.x, obj.y, obj.w, obj.h,
          obj.type, obj.solid, obj.data, obj.typeSpecific
        ));
      }
      
      console.log("LOADED LEVEL ID: "+lvlId);
    }else{
      console.log("COULDNT LOAD LEVEL ID: "+lvlId);
    }
  }
  
}