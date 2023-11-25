var vec3 = vec3 || {};

vec3.new = function(x, y, z){
  return [x, y, z];
}
vec3.copy = function(v){
  return vec3.new(v[0], v[1], v[2]);
}
vec3.getLength = function(v){
  return Math.cbrt(v[0]*v[0] + v[1]*v[1] + v[2]*v[2]);
}
vec3.getNormalized = function(v){
  let d = vec3.getLength(v);
  let x = v[0] / d;
  let y = v[1] / d;
  let z = v[2] / d;
  return vec3.new(x, y, z);
}
vec3.normalize = function(v){
  let d = vec3.getLength(v);
  v[0] = v[0]/d;
  v[1] = v[1]/d;
  v[2] = v[2]/d;
}
vec3.scale = function(v, scalar){
  v[0] = v[0]*scalar;
  v[1] = v[1]*scalar;
  v[2] = v[2]*scalar;
}
vec3.getAdded = function(v1, v2){
  return vec3.new(v1[0]+v2[0], v1[1]+v2[1], v1[2]+v2[2]);
}
vec3.getSubtracted = function(v1, v2){
  return vec3.new(v1[0]-v2[0], v1[1]-v2[1], v1[2]-v2[2]);
}
vec3.getMultiplied = function(v1, v2){
  return vec3.new(v1[0]*v2[0], v1[1]*v2[1], v1[2]*v2[2]);
}
vec3.getScaled = function(v, scalar){
  return vec3.new(v[0]*scalar, v[1]*scalar, v[2]*scalar);
}
vec3.getDotProduct = function(v1, v2){
  return v1[0]*v2[0] + v1[1]*v2[1] + v1[2]*v2[2];
}
vec3.getCrossProduct = function(v1, v2){
  let x = v1[1]*v2[2] - v1[2]*v2[1];
  let y = v1[2]*v2[0] - v1[0]*v2[2];
  let z = v1[0]*v2[1] - v1[1]*v2[0];
  return vec3.new(x, y, z);
}
vec3.rotateZ = function(v1, a){
  let v2 = vec3.copy(v1);
  let sina = Math.sin(a);
  let cosa = Math.cos(a);
  v1[0] = (v2[0]*cosa + v2[1]*-sina + v2[2]*0);
  v1[1] = (v2[0]*sina + v2[1]*cosa + v2[2]*0);
  v1[2] = (v2[0]*0 + v2[1]*0 + v2[2]*1);
}
vec3.rotateY = function(v1, a){
  let v2 = vec3.copy(v1);
  let sina = Math.sin(a);
  let cosa = Math.cos(a);
  v1[0] = (v2[0]*cosa + v2[1]*0 + v2[2]*sina);
  v1[1] = (v2[0]*0 + v2[1]*1 + v2[2]*0);
  v1[2] = (v2[0]*-sina + v2[1]*0 + v2[2]*cosa);
}
vec3.rotateX = function(v1, a){
  let v2 = vec3.copy(v1);
  let sina = Math.sin(a);
  let cosa = Math.cos(a);
  v1[0] = (v2[0]*1 + v2[1]*0 + v2[2]*0);
  v1[1] = (v2[0]*0 + v2[1]*cosa + v2[2]*-sina);
  v1[2] = (v2[0]*0 + v2[1]*sina + v2[2]*cosa);
}
vec3.rotate = function(v, ax, ay, az){
  vec3.rotateX(v, ax);
  vec3.rotateY(v, ay);
  vec3.rotateZ(v, az);
}