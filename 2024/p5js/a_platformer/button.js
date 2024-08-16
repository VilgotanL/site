//button


function Button(x, y, w, h, txt, tSize, upColor, hoverColor, downColor){
  this.x = x || 0;
  this.y = y || 0;
  this.w = w || 100;
  this.h = h || 100;
  
  this.text = txt || "Button";
  this.textSize = tSize || 25;
  this.textXoff = 0;
  this.textYoff = 0;
  
  this.upColor = upColor || color(200);
  this.hoverColor = hoverColor || color(180);
  this.downColor = downColor || color(120);
  
  this.state = 0;
  this.down = false;
  this.pressed = false;
  this.prevDown = false;
  
  
  this.draw = function(){
    push();
    switch(this.state){
      case 0:
        fill(this.upColor);
        break;
      case 1:
        fill(this.hoverColor);
        break;
      case 2:
        fill(this.downColor);
        break;
    }
    stroke(0);
    strokeWeight(2);
    rect(this.x, this.y, this.w, this.h);
    textSize(this.textSize);
    textAlign(CENTER, CENTER);
    strokeWeight(0);
    fill(0);
    let txtXoff = this.textSize/7.8 + this.textXoff;
    let txtYoff = this.textSize/11 + this.textYoff;
    text(this.text, this.x+txtXoff, this.y+txtYoff, this.w, this.h);
    pop();
  }
  this.update = function(){
    if(mouseX > this.x && mouseY > this.y && 
       mouseX < this.x+this.w && mouseY < this.y+this.h){
      if(mouseIsPressed && mouseButton == LEFT){
        this.state = 2;
        this.down = true;
        this.pressed = false;
        this.prevDown = true;
      }else{
        this.state = 1;
        this.down = false;
        if(this.prevDown == true){
          this.pressed = true;
        }else{
          this.pressed = false;
        }
        this.prevDown = false;
      }
    }else{
      this.state = 0;
      this.down = false;
      this.pressed = false;
      this.prevDown = false;
    }
  }
}