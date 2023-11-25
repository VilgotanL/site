var v3d = v3d || {}; //main namespace




//Mesh



v3d.Mesh = function(xPos, yPos, zPos, xRot, yRot){
  
  this.triangles = [];
  
  this.x = xPos || 0;
  this.y = yPos || 0;
  this.z = zPos || 0;
  
  this.xRot = xRot || 0;
  this.yRot = yRot || 0;
  
  this.setRotation = function(xRot, yRot){
    this.xRot = xRot;
    this.yRot = yRot;
  }
  this.setSurfaceColor = function(r, g, b){
    for(let i=0; i<this.triangles.length; i++){
      this.triangles[i].setSurfaceColor(r, g, b);
    }
  }
  this.setSurfaceColorToRandomGrayscale = function(){
    for(let i=0; i<this.triangles.length; i++){
      let b = random(0, 255);
      this.triangles[i].setSurfaceColor(b, b, b);
    }
  }
  
  this.drawWireFrame = function(cam){
    for(let i=0; i<this.triangles.length; i++){
      let t = this.triangles[i].copy();
      
      //rotate by mesh angles
      t.a.rotate(this.xRot, this.yRot);
      t.b.rotate(this.xRot, this.yRot);
      t.c.rotate(this.xRot, this.yRot);
      
      //translate by mesh pos
      let meshPos = v3d.createVector(this.x, this.y, this.z);
      t.a.add(meshPos);
      t.b.add(meshPos);
      t.c.add(meshPos);
      
      t.drawWireFrame(cam);
    }
  }
  this.drawNormalsWireFrame = function(cam, lengthMult){
    for(let i=0; i<this.triangles.length; i++){
      let t = this.triangles[i].copy();
      
      //rotate by mesh angles
      t.a.rotate(this.xRot, this.yRot);
      t.b.rotate(this.xRot, this.yRot);
      t.c.rotate(this.xRot, this.yRot);
      
      //translate by mesh pos
      let meshPos = v3d.createVector(this.x, this.y, this.z);
      t.a.add(meshPos);
      t.b.add(meshPos);
      t.c.add(meshPos);
      
      let tSNorm = t.getSurfaceNormal();
      if(lengthMult){
        tSNorm.mult(lengthMult);
      }
      
      //center of triangle
      let tX = (t.a.x + t.b.x + t.c.x)/3;
      let tY = (t.a.y + t.b.y + t.c.y)/3;
      let tZ = (t.a.z + t.b.z + t.c.z)/3;
      
      let newT = new v3d.Triangle(tX, tY, tZ, tX, tY, tZ,
                                  tX+tSNorm.x,tY+tSNorm.y,tZ+tSNorm.z);
      
      newT.drawWireFrame(cam, color(255, 0, 0));
      let newT2 = new v3d.Triangle(tX+tSNorm.x,tY+tSNorm.y,tZ+tSNorm.z,
                                  tX+tSNorm.x,tY+tSNorm.y,tZ+tSNorm.z,
                                  tX+tSNorm.x,tY+tSNorm.y,tZ+tSNorm.z);
      newT2.drawWireFrame(cam, color(0, 0, 255));
    }
  }
  this.draw = function(cam){
    for(let i=0; i<this.triangles.length; i++){
      let t = this.triangles[i].copy();
      
      //rotate by mesh angles
      t.a.rotate(this.xRot, this.yRot);
      t.b.rotate(this.xRot, this.yRot);
      t.c.rotate(this.xRot, this.yRot);
      
      //translate by mesh pos
      let meshPos = v3d.createVector(this.x, this.y, this.z);
      t.a.add(meshPos);
      t.b.add(meshPos);
      t.c.add(meshPos);
      
      t.draw(cam);
    }
  }
  this.addTriangle = function(t){
    this.triangles.push(t);
  }
}


//this has the normals pointing outward
v3d.createBoxMesh = function(xMidPos, yMidPos, zMidPos, xSize, ySize, zSize){
  let m = new v3d.Mesh(xMidPos, yMidPos, zMidPos, 0, 0);
  let x = xSize/2;
  let y = ySize/2;
  let z = zSize/2;
  //front
  m.addTriangle(new v3d.Triangle(-x,y,-z,x,y,-z,x,-y,-z));
  m.addTriangle(new v3d.Triangle(-x,y,-z,x,-y,-z,-x,-y,-z));
  //back
  m.addTriangle(new v3d.Triangle(x,y,z,-x,y,z,x,-y,z));
  m.addTriangle(new v3d.Triangle(x,-y,z,-x,y,z,-x,-y,z));
  //right
  m.addTriangle(new v3d.Triangle(x,y,z,x,-y,z,x,-y,-z));
  m.addTriangle(new v3d.Triangle(x,y,z,x,-y,-z,x,y,-z));
  //left
  m.addTriangle(new v3d.Triangle(-x,-y,z,-x,y,z,-x,-y,-z));
  m.addTriangle(new v3d.Triangle(-x,-y,-z,-x,y,z,-x,y,-z));
  //top
  m.addTriangle(new v3d.Triangle(x,y,z,x,y,-z,-x,y,-z));
  m.addTriangle(new v3d.Triangle(x,y,z,-x,y,-z,-x,y,z));
  //bottom
  m.addTriangle(new v3d.Triangle(x,-y,-z,x,-y,z,-x,-y,-z));
  m.addTriangle(new v3d.Triangle(-x,-y,-z,x,-y,z,-x,-y,z));
  return m;
}