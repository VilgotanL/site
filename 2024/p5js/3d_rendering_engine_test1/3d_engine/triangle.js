var v3d = v3d || {}; //main namespace

//3d Triangle

v3d.Triangle = function(ax, ay, az, bx, by, bz, cx, cy, cz){
  this.a = v3d.createVector(ax, ay, az);
  this.b = v3d.createVector(bx, by, bz);
  this.c = v3d.createVector(cx, cy, cz);
  
  this.surfaceColorR = 255;
  this.surfaceColorG = 255;
  this.surfaceColorB = 255;
  
  this.set = function(ax, ay, az, bx, by, bz, cx, cy, cz){
    this.a = v3d.createVector(ax, ay, az);
    this.b = v3d.createVector(bx, by, bz);
    this.c = v3d.createVector(cx, cy, cz);
  }
  this.copy = function(){
    let newT = new v3d.Triangle(this.a.x, this.a.y, this.a.z, this.b.x, this.b.y, this.b.z, this.c.x, this.c.y, this.c.z);
    newT.setSurfaceColor(this.surfaceColorR, this.surfaceColorG, this.surfaceColorB);
    return newT;
  }
  this.setSurfaceColor = function(r, g, b){
    this.surfaceColorR = r;
    this.surfaceColorG = g;
    this.surfaceColorB = b;
  }
  this.setSurfaceColorToRandomGrayscale = function(){
    let b = random(0, 255);
    this.setSurfaceColor(b, b, b);
  }
  this.getSurfaceNormal = function(){
    let v = this.b.copy();
    v.sub(this.a);
    let w = this.c.copy();
    w.sub(this.a);
    
    let crossP = v.getCrossProduct(w);
    let crossPLength = sqrt(crossP.x**2 + crossP.y**2 + crossP.z**2);
    crossP.divide(crossPLength);
    return (crossP);
  }
  
  this.drawWireFrame = function(cam, strokeColor){
    let a = this.a.copy();
    let b = this.b.copy();
    let c = this.c.copy();
    let canv = cam.canvas;
    let w = cam.canvWidth;
    let h = cam.canvHeight;
    let fov = cam.fov;
    push();
    canv.strokeWeight(5);
    canv.stroke(100);
    
    //subtract cam pos
    let camPosV = v3d.createVector(cam.x, cam.y, cam.z);
    a.sub(camPosV);
    b.sub(camPosV);
    c.sub(camPosV);
    
    //rotate around cam (y first works for some reason)
    a.rotate(0, -cam.yRot);
    b.rotate(0, -cam.yRot);
    c.rotate(0, -cam.yRot);
    a.rotate(-cam.xRot, 0);
    b.rotate(-cam.xRot, 0);
    c.rotate(-cam.xRot, 0);
    
    //dont draw triangle if any part of it is behind the camera
    if(a.z < cam.nearZ || b.z < cam.nearZ || c.z < cam.nearZ){
      return;
    }
    
    if(strokeColor){
      canv.stroke(strokeColor);
    }
    
    //draw lines
    let points = [a,b,c,a];
    for(let i=0; i<3; i++){
      let p = points[i];
      let p2 = points[i+1];
      
      let pX = (( fov*(p.x/p.z) )*w/2)+w/2;
      let pY = (( fov*(p.y/-p.z) )*h/2)+h/2;
      let p2X = (( fov*(p2.x/p2.z) )*w/2)+w/2;
      let p2Y = (( fov*(p2.y/-p2.z) )*h/2)+h/2;
      
      canv.line(pX, pY, p2X, p2Y);
    }
    pop();
  }
  
  this.draw = function(cam){
    let a = this.a.copy();
    let b = this.b.copy();
    let c = this.c.copy();
    let canv = cam.canvas;
    let w = cam.canvWidth;
    let h = cam.canvHeight;
    let fov = cam.fov;
    
    //subtract cam pos
    let camPosV = v3d.createVector(cam.x, cam.y, cam.z);
    a.sub(camPosV);
    b.sub(camPosV);
    c.sub(camPosV);
    
    //rotate around cam (y first works for some reason)
    a.rotate(0, -cam.yRot);
    b.rotate(0, -cam.yRot);
    c.rotate(0, -cam.yRot);
    a.rotate(-cam.xRot, 0);
    b.rotate(-cam.xRot, 0);
    c.rotate(-cam.xRot, 0);
    
    //dont draw triangle if any part of it is behind the camera
    if(a.z < cam.nearZ || b.z < cam.nearZ || c.z < cam.nearZ){
      return;
    }
    
    //backface culling
    let camToAvec = a; //no subtract cuz we already subbed cam pos
    let tNormal = this.getSurfaceNormal(); //get t normal
    tNormal.rotate(0, -cam.yRot); //rotate surface normal with camera rot
    tNormal.rotate(-cam.xRot, 0);
    if(camToAvec.getDotProduct(tNormal) >= 0){ //dont draw if facing away
       return;
    }
    
    
    push();
    canv.strokeWeight(0);
    //console.log(this.surfaceColorR); //WHY IS IT ALWAYS 255?
    canv.fill(this.surfaceColorR, this.surfaceColorG, this.surfaceColorB);
    
    //draw lines
    
    let aX = (( fov*(a.x/a.z) )*w/2)+w/2;
    let aY = (( fov*(a.y/-a.z) )*h/2)+h/2;
    let bX = (( fov*(b.x/b.z) )*w/2)+w/2;
    let bY = (( fov*(b.y/-b.z) )*h/2)+h/2;
    let cX = (( fov*(c.x/c.z) )*w/2)+w/2;
    let cY = (( fov*(c.y/-c.z) )*h/2)+h/2;
    
    triangle(aX, aY, bX, bY, cX, cY);
    
    pop();
  }
}

