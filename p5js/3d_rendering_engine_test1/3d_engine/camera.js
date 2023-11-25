var v3d = v3d || {}; //main namespace





v3d.Camera = function(canv, startX, startY, startZ, fov, nearZ, w, h, sXrot, sYrot){
  this.x = startX || 0;
  this.y = startY || 0;
  this.z = startZ || 0;
  
  this.xRot = sXrot || 0;
  this.yRot = sYrot || 0;
  
  this.fov = fov || 90;
  this.nearZ = nearZ || 0.5;
  this.canvas = canv;
  this.canvWidth = w || canv.width;
  this.canvHeight = h || canv.height;
  
  
  //quick way to make world navigatable
  this.updateCameraMovement = function(moveSpeed, rotSpeed){
    this.xRot += movedY * rotSpeed;
    this.yRot += movedX * rotSpeed;
    
    let sinMove = sin(this.yRot) * moveSpeed;
    let cosMove = cos(this.yRot) * moveSpeed;
    
    if(keyIsDown(87)){ //w
      this.z += cosMove;
      this.x += sinMove;
    }
    if(keyIsDown(83)){ //s
      this.z -= cosMove;
      this.x -= sinMove;
    }
    if(keyIsDown(65)){ //a
      this.z += sinMove;
      this.x -= cosMove;
    }
    if(keyIsDown(68)){ //d
      this.z -= sinMove;
      this.x += cosMove;
    }
    if(keyIsDown(69)){ //e
      this.y += moveSpeed;
    }
    if(keyIsDown(81)){ //q
      this.y -= moveSpeed;
    }
  }
}