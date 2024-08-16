//plr


function Player(level){
  this.lvl = level;
  
  this.x = 0;
  this.y = 0;
  this.w = 40;
  
  this.yVel = 0;
  this.grav = 0.35;
  
  this.moveSpeed = 4;
  this.jumpForce = 9;
  
  
  this.update = function(){
    //Move out of moving solids way if colliding
    let moveOutRange = 10;
    //TRY UP
    if(this.isColliding()){
      this.y -= moveOutRange;
      if(!this.isColliding()){
        while(!this.isColliding()){
          this.y += 1;
        }
        this.y -= 1;
      }else{this.y += moveOutRange;}
    }
    //TRY DOWN
    if(this.isColliding()){
      this.y += moveOutRange;
      if(!this.isColliding()){
        while(!this.isColliding()){
          this.y -= 1;
        }
        this.y += 1;
      }else{this.y -= moveOutRange;}
    }
    //TRY LEFT
    if(this.isColliding()){
      this.x -= moveOutRange;
      if(!this.isColliding()){
        while(!this.isColliding()){
          this.x += 1;
        }
        this.x -= 1;
      }else{this.x += moveOutRange;}
    }
    //TRY RIGHT
    if(this.isColliding()){
      this.x += moveOutRange;
      if(!this.isColliding()){
        while(!this.isColliding()){
          this.x -= 1;
        }
        this.x += 1;
      }else{this.x -= moveOutRange;}
    }
    
    
    //now we shouldnt be colliding (unless were very inside solid)
    
    //HORIZONTAL MOVEMENT
    if( !(keyIsDown(65) && keyIsDown(68)) ){ //if not both keys down
      if(keyIsDown(65)){ //a
        this.x -= this.moveSpeed;
        while(this.isColliding()){
          this.x += 1;
        }
      }
      if(keyIsDown(68)){ //d
        this.x += this.moveSpeed;
        while(this.isColliding()){
          this.x -= 1;
        }
      }
    }
    
    //VERTICAL MOVEMENT & PHYSICS
    
    //jump control
    if(keyIsDown(87)){ //w down
      this.y += 1;
      if(this.isColliding()){
        this.yVel = -this.jumpForce;
      }
      this.y -= 1;
    }
    
    //physics
    this.y += this.yVel;
    this.y += 1;
    if(this.isColliding()){
      if(this.yVel >= 0){
        while(this.isColliding()){
          this.y -= 1;
        }
      }
      if(this.yVel < 0){
        while(this.isColliding()){
          this.y += 1;
        }
      }
      this.yVel = 0;
    }else{
      this.y -= 1;
      this.yVel += this.grav;
    }
    
  }
  this.isColliding = function(){
    for(let i=0; i<this.lvl.objs.length; i++){
      let obj = this.lvl.objs[i];
      if(obj.solid == true){
        if(this.intersects(obj)){
          return true;
        }
      }
    }
    return false;
  }
  this.intersects = function(obj){
    if(this.x < obj.x+obj.w && this.y < obj.y+obj.h &&
       this.x+this.w > obj.x && this.y+this.w > obj.y){
      return true;
    }
    return false;
  }
  
  this.draw = function(){
    push();
    stroke(0);
    strokeWeight(2);
    fill(0, 220, 0);
    rect(width/2-this.w/2, height/2-this.w/2, this.w, this.w);
    pop();
  }
  
}