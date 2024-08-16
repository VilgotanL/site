var tri3 = tri3 || {}

tri3.new = function(v1, v2, v3, c){
  if(c){
    return [v1, v2, v3, c];
  }else{
    return [v1, v2, v3, [random(0, 255), random(0, 255), random(0, 255)]];
  }
}
tri3.copy = function(t){
  let c = [t[3][0], t[3][1], t[3][2]];
  return tri3.new(vec3.copy(t[0]), vec3.copy(t[1]), vec3.copy(t[2]), c);
}
tri3.getNormal = function(t){
  let b = vec3.getSubtracted(t[1], t[0]);
  let a = vec3.getSubtracted(t[2], t[0]);
  return vec3.getNormalized(vec3.getCrossProduct(b, a));
}

var texTri3 = texTri3 || {};
texTri3.isTexTriangle = function(t){
  return t.length == 5;
}
texTri3.new = function(v1, v2, v3, tx, d){
  if(!(tx && d)){
    return [v1, v2, v3, tx, d];
  }else{
    return [v1, v2, v3, grass, [[0,0],[1,0],[1,1]]];
  }
}
texTri3.copy = function(t){
  let tx = t[3];
  let uv = [[t[4][0][0],t[4][0][1]],[t[4][1][0],t[4][1][1]],[t[4][2][0],t[4][2][1]]];
  return texTri3.new(vec3.copy(t[0]), vec3.copy(t[1]), vec3.copy(t[2]), tx, uv);
}
texTri3.getNormal = function(t){
  let b = vec3.getSubtracted(t[1], t[0]);
  let a = vec3.getSubtracted(t[2], t[0]);
  return vec3.getNormalized(vec3.getCrossProduct(b, a));
}