var mesh3 = mesh3 || {};

function Mesh3(){
  this.triangles = [];
  this.pos = vec3.new(0, 0, 0);
  this.rot = vec3.new(0, 0, 0);
  
  this.addTriangle = function(t){
    this.triangles.push(t);
  }
  this.addTexTriangle = function(t){
    this.triangles.push(t);
  }
  this.addNewTriangle = function(x1, y1, z1, x2, y2, z2, x3, y3, z3){
    let v1 = vec3.new(x1, y1, z1);
    let v2 = vec3.new(x2, y2, z2);
    let v3 = vec3.new(x3, y3, z3);
    this.addTriangle(tri3.new(v1, v2, v3));
  }
  this.addNewTexTriangle = function(tx, x1, y1, z1, u1, v1, x2, y2, z2, u2, v2, x3, y3, z3, u3, v3){
    let vc1 = vec3.new(x1, y1, z1);
    let vc2 = vec3.new(x2, y2, z2);
    let vc3 = vec3.new(x3, y3, z3);
    let uv = [[u1, v1], [u2, v2], [u3, v3]];
    let t = texTri3.new(vc1, vc2, vc3, tx, uv);
    
    this.addTexTriangle(t);
  }
  this.getToWorldSpace = function(t){
    let t2 = tri3.copy(t);
    //rotate by mesh rot
    vec3.rotate(t2[0], this.rot[0], this.rot[1], this.rot[2]);
    vec3.rotate(t2[1], this.rot[0], this.rot[1], this.rot[2]);
    vec3.rotate(t2[2], this.rot[0], this.rot[1], this.rot[2]);
    
    //subtract mesh pos
    t2[0] = vec3.getAdded(t2[0], this.pos);
    t2[1] = vec3.getAdded(t2[1], this.pos);
    t2[2] = vec3.getAdded(t2[2], this.pos);
    return t2;
  }
}
mesh3.new = function(){
  return new Mesh3();
}
mesh3.box = function(x, y, z){
  let m = mesh3.new();
  
  //front
  m.addNewTriangle(-x, y, -z, x, y, -z, x, -y, -z);
  m.addNewTriangle(-x, y, -z, x, -y, -z, -x, -y, -z);
  //back
  m.addNewTriangle(x, y, z, -x, y, z, x, -y, z);
  m.addNewTriangle(x, -y, z, -x, y, z, -x, -y, z);
  //top
  m.addNewTriangle(x, y, -z, -x, y, -z, x, y, z);
  m.addNewTriangle(x, y, z, -x, y, -z, -x, y, z);
  //bottom
  m.addNewTriangle(-x, -y, -z, x, -y, -z, x, -y, z);
  m.addNewTriangle(-x, -y, -z, x, -y, z, -x, -y, z);
  //left
  m.addNewTriangle(-x, y, z, -x, y, -z, -x, -y, z);
  m.addNewTriangle(-x, -y, z, -x, y, -z, -x, -y, -z);
  //right
  m.addNewTriangle(x, y, -z, x, y, z, x, -y, z);
  m.addNewTriangle(x, y, -z, x, -y, z, x, -y, -z);
  
  return m;
}