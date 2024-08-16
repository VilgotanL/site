var v3d = v3d || {}; //main namespace

//3d Vector

v3d.Vector = function(x, y, z){
  this.x = x || 0;
  this.y = y || 0;
  this.z = z || 0;
  
  this.set = function(x, y, z){
    this.x = x || 0;
    this.y = y || 0;
    this.z = z || 0;
  }
  this.copy = function(){
    return new v3d.Vector(this.x, this.y, this.z);
  }
  this.getLength = function(){
    return Math.sqrt(this.x**2 + this.y**2 + this.z**2);
  }
  this.getNormal = function(){
    let length = this.getLength();
    return new v3d.Vector(this.x/length, this.y/length, this.z/length);
  }
  this.getDotProduct = function(otherVec){
    return this.x*otherVec.x + this.y*otherVec.y + this.z*otherVec.z;
  }
  this.getCrossProduct = function(otherVec){
    let ax = this.x;
    let ay = this.y;
    let az = this.z;
    let bx = otherVec.x;
    let by = otherVec.y;
    let bz = otherVec.z;
    let cX = ay*bz - az*by;
    let cY = az*bx - ax*bz;
    let cZ = ax*by - ay*bx;
    return v3d.createVector(cX, cY, cZ);
  }
  //Basic operations
  this.add = function(otherVec){
    this.x += otherVec.x;
    this.y += otherVec.y;
    this.z += otherVec.z;
  }
  this.sub=this.subtract = function(otherVec){
    this.x -= otherVec.x;
    this.y -= otherVec.y;
    this.z -= otherVec.z;
  }
  this.mult = function(val){
    this.x *= val;
    this.y *= val;
    this.z *= val;
  }
  this.div=this.divide = function(val){
    this.x /= val;
    this.y /= val;
    this.z /= val;
  }
  
  this.rotate = function(xAng, yAng){
    //x rot
    let x2 = this.x;
    let y2 = this.y*cos(xAng) - this.z*sin(xAng);
    let z2 = this.z*cos(xAng) + this.y*sin(xAng);
    
    //y rot
    let x3 = x2*cos(yAng) + z2*sin(yAng);
    let y3 = y2;
    let z3 = z2*cos(yAng) - x2*sin(yAng);
    
    this.x = x3;
    this.y = y3;
    this.z = z3;
  }
}

//Other Vector functions

v3d.vectorDotProduct = function(vec1, vec2){
  return vec1.x*vec2.x + vec1.y*vec2.y + vec1.z*vec2.z;
}
//createVector
v3d.createVector = function(x, y, z){
  return new v3d.Vector(x, y, z);
}