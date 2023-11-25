//object

function Obj(x, y, w, h, type, solid, data, typeSpecific){
  this.x = x;
  this.y = y;
  this.w = w;
  this.h = h;
  this.solid = solid;
  this.type = type;
  this.data = data;
  this.typeSpecific = typeSpecific;
  
  this.update = function(lvl){
    if(lvl.plr.intersects(this)){
      if(this.typeSpecific.loadLevelOnCollide !== undefined ){
        lvl.loadLevel(this.typeSpecific.loadLevelOnCollide);
      }
      if(this.type == "death_block"){
        lvl.loadLevel(lvl.id);
      }
    }
    
    if(this.data.pathMoving === true){
      this.pathMpercent = this.pathMpercent || 0;
      this.pathMdir = this.pathMdir || 1;
      
      this.pathMpercent += data.pathSpeed*this.pathMdir;
      if(this.pathMpercent >= 1){
        this.pathMpercent = 1;
        this.pathMdir = -1;
      }else if(this.pathMpercent <= 0){
        this.pathMpercent = 0;
        this.pathMdir = 1;
      }
      this.x = data.path[0] + (data.path[2] - data.path[0])*this.pathMpercent;
      this.y = data.path[1] + (data.path[3] - data.path[1])*this.pathMpercent;
    }
    
    
  }
  this.draw = function(xOff, yOff){
    push();
    
    if(this.type == "solid_block"){
      stroke(0);
      strokeWeight(2);
      fill(100);
      rect(this.x + xOff, this.y + yOff, this.w, this.h);
    }else if(this.type == "death_block"){
      stroke(0);
      strokeWeight(2);
      fill(250, 0, 0);
      rect(this.x + xOff, this.y + yOff, this.w, this.h);
    }else if(this.type == "finish_block"){
      stroke(0);
      strokeWeight(2);
      for(let i=0; i<4; i++){
        for(let j=0; j<4; j++){
          fill(((i+j+1) % 2) * 255);
          rect(this.x+xOff + i*this.w/4, this.y+yOff + j*this.h/4, this.w/4, this.h/4);
        }
      }
    }else{
      stroke(0);
      strokeWeight(2);
      fill(255, 0, 255);
      rect(this.x + xOff, this.y + yOff, this.w, this.h);
    }
    
    pop();
  }
}