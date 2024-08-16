var cam3 = cam3 || {};

function Cam3(){
  this.pos = vec3.new(0, 0, 0);
  this.rot = vec3.new(0, 0, 0);
  this.left = -1;
  this.right = 1;
  this.top = -1;
  this.bottom = 1;
  this.forward = -1;
  
  this.w = width;
  this.h = height;
  
  this.xFactor = this.w/2;
  this.yFactor = this.h/2;
  
  
  this.transform = function(v){ //transform to view space
    let zInv = 1 / v[2];
    v[0] = (v[0] * zInv + 1.0) * this.xFactor;
    v[1] = (-v[1] * zInv + 1.0) * this.yFactor;
    return v;
  }
  this.getTransformed = function(v){
    return this.transform(vec3.copy(v));
  }
  this.getLookVector = function(){
    
  }
  this.startDraw = function(){
    loadPixels();
  }
  this.endDraw = function(){
    updatePixels();
  }
  this.min = function(a, b){
    return a < b ? a : b;
  }
  this.drawWireFrame = function(o){
    push();
    for(let i=0; i<o.triangles.length; i++){
      let t = o.getToWorldSpace(o.triangles[i]);
      let v1 = this.getTransformed(t[0]);
      let v2 = this.getTransformed(t[1]);
      let v3 = this.getTransformed(t[2]);
      
      stroke(0);
      strokeWeight(10);
      line(v1[0], v1[1], v2[0], v2[1]);
      line(v2[0], v2[1], v3[0], v3[1]);
      line(v3[0], v3[1], v1[0], v1[1]);
      
      //show triangle normal
      let showMag = 0.2;
      let norm = vec3.getScaled(tri3.getNormal(t), showMag);
      let avgT = vec3.getScaled(vec3.getAdded(t[0], vec3.getAdded(t[1], t[2])), 1/3);
      let showStart = this.getTransformed(avgT);
      let showEnd = this.getTransformed(vec3.getAdded(avgT, norm));
      
      stroke(255, 0, 0);
      line(showStart[0], showStart[1], showEnd[0], showEnd[1]);
    }
    pop();
  }
  this.renderTriangle = function(o, ot){
    let t = o.getToWorldSpace(ot);
    let tColor = color(ot[3][0], ot[3][1], ot[3][2]);
    let v0 = t[0];
    let v1 = t[1];
    let v2 = t[2];
    
    //backface culling
    let norm = tri3.getNormal(t);
    let dotProd = vec3.getDotProduct(norm, v0);
    let dontDraw = dotProd >= 0;
    
    //transform to screen space
    v0 = this.getTransformed(t[0]);
    v1 = this.getTransformed(t[1]);
    v2 = this.getTransformed(t[2]);
    
    if(!dontDraw){
      this.drawTriangle(v0, v1, v2, tColor);
    }
  }
  this.renderTexTriangle = function(o, ot){
    let t = o.getToWorldSpace(ot);
    let v0 = t[0];
    let v1 = t[1];
    let v2 = t[2];
    
    //backface culling
    let norm = tri3.getNormal(t);
    let dotProd = vec3.getDotProduct(norm, v0);
    let dontDraw = dotProd >= 0;
    
    //transform to screen space
    v0 = this.getTransformed(t[0]);
    v1 = this.getTransformed(t[1]);
    v2 = this.getTransformed(t[2]);
    
    let tx = ot[3];
    let uv = ot[4];
    
    if(!dontDraw){
      this.drawTexTriangle(v0, v1, v2, tx, uv);
    }
  }
  this.draw = function(o){
    push();
    for(let i=0; i<o.triangles.length; i++){
      if(texTri3.isTexTriangle(o.triangles[i])){
        this.renderTexTriangle(o, o.triangles[i]);
      }else{
        this.renderTriangle(o, o.triangles[i]);
      }
    }
    pop();
  }
  this.drawTriangle = function(v0, v1, v2, c){
    //triangle(v0[0], v0[1], v1[0], v1[1], v2[0], v2[1]);
    
    //sort by y
    if(v1[1] < v0[1]){
      let tmp = v1; v1 = v0; v0 = tmp;
    }
    if(v2[1] < v1[1]){
      let tmp = v2; v2 = v1; v1 = tmp;
    }
    if(v1[1] < v0[1]){
      let tmp = v1; v1 = v0; v0 = tmp;
    }
    //check if flat bottom or top
    if(v0[1] == v1[1]){ //flat top
      //sort top verts by x
      if(v1[0] < v0[0]){
        let tmp = v1; v1 = v0; v0 = tmp;
      }
      this.drawFlatTopTriangle(v0, v1, v2, c);
    }else if(v1[1] == v2[1]){
      //sort bottom verts by x
      if(v2[0] < v1[0]){
        let tmp = v2; v2 = v1; v1 = tmp;
      }
      this.drawFlatBottomTriangle(v0, v1, v2, c);
    }else{ // general triangle
      let alphaSplit = (v1[1] - v0[1]) / (v2[1] - v0[1]);
      let vi = vec3.getAdded(v0, 
            vec3.getScaled(vec3.getSubtracted(v2, v0), alphaSplit));
      
      if(v1[0] < vi[0]){ // major right
        this.drawFlatBottomTriangle(v0, v1, vi, c);
        this.drawFlatTopTriangle(v1, vi, v2, c);
      }else{ // major left
        this.drawFlatBottomTriangle(v0, vi, v1, c);
        this.drawFlatTopTriangle(vi, v1, v2, c);
      }
    }
  }
  this.drawTexTriangle = function(v0, v1, v2, tx, uv){
    //add uv to vectors
    v0[3] = uv[0][0];
    v0[4] = uv[0][1];
    v1[3] = uv[1][0];
    v1[4] = uv[1][1];
    v2[3] = uv[2][0];
    v2[4] = uv[2][1];
    
    //sort by y
    if(v1[1] < v0[1]){
      let tmp = v1; v1 = v0; v0 = tmp;
    }
    if(v2[1] < v1[1]){
      let tmp = v2; v2 = v1; v1 = tmp;
    }
    if(v1[1] < v0[1]){
      let tmp = v1; v1 = v0; v0 = tmp;
    }
    //check if flat bottom or top
    if(v0[1] == v1[1]){ //flat top
      //sort top verts by x
      if(v1[0] < v0[0]){
        let tmp = v1; v1 = v0; v0 = tmp;
      }
      this.drawFlatTopTriangleTex(v0, v1, v2, tx);
    }else if(v1[1] == v2[1]){
      //sort bottom verts by x
      if(v2[0] < v1[0]){
        let tmp = v2; v2 = v1; v1 = tmp;
      }
      this.drawFlatBottomTriangleTex(v0, v1, v2, tx);
    }else{ // general triangle
      let alphaSplit = (v1[1] - v0[1]) / (v2[1] - v0[1]);
      let vi = vec3.getAdded(v0, 
            vec3.getScaled(vec3.getSubtracted(v2, v0), alphaSplit));
      vi[3] = v0[3] + ((v2[3] - v0[3]) * alphaSplit);
      vi[4] = v0[4] + ((v2[4] - v0[4]) * alphaSplit);
      
      if(v1[0] < vi[0]){ // major right
        this.drawFlatBottomTriangleTex(v0, v1, vi, tx);
        this.drawFlatTopTriangleTex(v1, vi, v2, tx);
      }else{ // major left
        this.drawFlatBottomTriangleTex(v0, vi, v1, tx);
        this.drawFlatTopTriangleTex(vi, v1, v2, tx);
      }
    }
  }
  this.drawFlatTopTriangleTex = function(v0, v1, v2, tx){
    let delta_y = v2[1] - v0[1];
    let dv0 = vec3.getScaled(vec3.getSubtracted(v2, v0), 1/delta_y);
    let dv1 = vec3.getScaled(vec3.getSubtracted(v2, v1), 1/delta_y);
    
    dv0[3] = (v2[3] - v0[3]) / delta_y;
    dv0[4] = (v2[4] - v0[4]) / delta_y;
    dv1[3] = (v2[3] - v1[3]) / delta_y;
    dv1[4] = (v2[4] - v1[4]) / delta_y;
    
    let itEdge1 = vec3.copy(v1);
    itEdge1[3] = v1[3];
    itEdge1[4] = v1[4];
    
    this.drawFlatTriangleTex(v0, v1, v2, tx, dv0, dv1, itEdge1);
  }
  this.drawFlatBottomTriangleTex = function(v0, v1, v2, tx){
    let delta_y = v2[1] - v0[1];
    let dv0 = vec3.getScaled(vec3.getSubtracted(v1, v0), 1/delta_y);
    let dv1 = vec3.getScaled(vec3.getSubtracted(v2, v0), 1/delta_y);
    
    dv0[3] = (v1[3] - v0[3]) / delta_y;
    dv0[4] = (v1[4] - v0[4]) / delta_y;
    dv1[3] = (v2[3] - v0[3]) / delta_y;
    dv1[4] = (v2[4] - v0[4]) / delta_y;
    
    let itEdge1 = vec3.copy(v0);
    itEdge1[3] = v0[3];
    itEdge1[4] = v0[4];
    
    this.drawFlatTriangleTex(v0, v1, v2, tx, dv0, dv1, itEdge1);
  }
  this.drawFlatTriangleTex = function(v0, v1, v2, tx, dv0, dv1, itEdge1){
    let itEdge0 = vec3.copy(v0);
    itEdge0[3] = v0[3];
    itEdge0[4] = v0[4];
    
    let yStart = Math.ceil(v0[1] - 0.5);
    let yEnd = Math.ceil(v2[1] - 0.5);
    
    let p03 = itEdge0[3];
    let p04 = itEdge0[4];
    itEdge0 = vec3.getAdded(itEdge0, vec3.getScaled(dv0, yStart - 0.5 + v0[1]));
    itEdge0[3] = p03 + (dv0[3] * (yStart - 0.5 + v0[1]));
    itEdge0[4] = p04 + (dv0[4] * (yStart - 0.5 + v0[1]));
    let p13 = itEdge1[3];
    let p14 = itEdge1[4];
    itEdge1 = vec3.getAdded(itEdge1, vec3.getScaled(dv1, yStart - 0.5 + v0[1]));
    itEdge1[3] = p13 + (dv1[3] * (yStart - 0.5 + v0[1]));
    itEdge1[4] = p14 + (dv1[4] * (yStart - 0.5 + v0[1]));
    
    let tex_w = tx.width;
    let tex_h = tx.height;
    let tex_clamp_x = tex_w - 1;
    let tex_clamp_y = tex_h - 1;
    
    function increase(){
      let p03 = itEdge0[3];
      let p04 = itEdge0[4];
      itEdge0 = vec3.getAdded(itEdge0, dv0);
      itEdge0[3] = p03 + dv0[3];
      itEdge0[4] = p04 + dv0[4];
      let p13 = itEdge1[3];
      let p14 = itEdge1[4];
      itEdge1 = vec3.getAdded(itEdge1, dv1);
      itEdge1[3] = p13 + dv1[3];
      itEdge1[4] = p14 + dv1[4];
    }
    
    for(let y=yStart; y<yEnd; y++, increase()){
      
      let xStart = Math.ceil(itEdge0[0] - 0.5);
      let xEnd = Math.ceil(itEdge1[0] - 0.5);
      
      let itEdge1tc = vec3.new(itEdge1[3], itEdge1[4], 0);
      let itEdge0tc = vec3.new(itEdge0[3], itEdge0[4], 0);
      let dtcLine = vec3.getScaled(vec3.getSubtracted(itEdge1tc, itEdge0tc), 1 / (itEdge1[0] - itEdge0[0]));
      
      let itcLine = vec3.getAdded(itEdge0tc, vec3.getScaled(dtcLine, 
                      xStart + 0.5 - itEdge0[0]));
      
      for(let x=xStart; x<xEnd; x++, itcLine = vec3.getAdded(itcLine, dtcLine)){
        let tcX = Math.floor(this.min(itcLine[0] * tex_w, tex_clamp_x));
        let tcY = Math.floor(this.min(itcLine[1] * tex_h, tex_clamp_y));
        let txIndex = 4 * (tcX + tcY * tex_w);
        let r = tx.pixels[txIndex];
        let g = tx.pixels[txIndex+1];
        let b = tx.pixels[txIndex+2];
        let index = 4 * (x + y * width);
        pixels[index] = r;
        pixels[index+1] = g;
        pixels[index+2] = b;
        pixels[index+3] = 255;
      }
    }
  }
  this.drawTexFlatTopTriangleOLD = function(v0, v1, v2, tx){
    //triangle(v0[0], v0[1], v1[0], v1[1], v2[0], v2[1]);
    let m0 = (v2[0] - v0[0]) / (v2[1] - v0[1]);
    let m1 = (v2[0] - v1[0]) / (v2[1] - v1[1]);
    
    let yStart = Math.ceil(v0[1] - 0.5);
    let yEnd = Math.ceil(v2[1] - 0.5);
    
    let tcEdgeL = vec3.new(v0[3], v0[4], 0);
    let tcEdgeR = vec3.new(v1[3], v1[4], 0);
    let tcBottom = vec3.new(v2[3], v2[4], 0);
    
    let tcEdgeStepL = vec3.getScaled(vec3.getSubtracted(tcBottom, tcEdgeL), 1 / (v2[1] - v0[1]));
    let tcEdgeStepR = vec3.getScaled(vec3.getSubtracted(tcBottom, tcEdgeR), 1 / (v2[1] - v1[1]));
    
    
    tcEdgeL = vec3.getAdded(tcEdgeL, vec3.getScaled(tcEdgeStepL, yStart + 0.5 - v1[1]));
    tcEdgeR = vec3.getAdded(tcEdgeR, vec3.getScaled(tcEdgeStepR, yStart + 0.5 - v1[1]));
    
    
    let tex_w = tx.width;
    let tex_h = tx.height;
    let tex_clamp_x = tex_w - 1;
    let tex_clamp_y = tex_h - 1;
    
    for(let y=yStart; y<yEnd; y++, tcEdgeL = vec3.getAdded(tcEdgeL, tcEdgeStepL), tcEdgeR = vec3.getAdded(tcEdgeR, tcEdgeStepR)){
      //start and end points of line
      let px0 = m0 * (y + 0.5 - v0[1]) + v0[0];
      let px1 = m1 * (y + 0.5 - v1[1]) + v1[0];
      
      //start and end pixels of line
      let xStart = Math.ceil(px0 - 0.5);
      let xEnd = Math.ceil(px1 - 0.5);
      
      let tcScanStep = vec3.getScaled(vec3.getSubtracted(tcEdgeR, tcEdgeL), 1 / (px1 - px0));
      
      let tc = vec3.getAdded(tcEdgeL, vec3.getScaled(tcScanStep, xStart + 0.5 - px0));
      
      for(let x=xStart; x<xEnd; x++, tc = vec3.getAdded(tc, tcScanStep)){
        let tcX = Math.floor(this.min(tc[0] * tex_w, tex_clamp_x));
        let tcY = Math.floor(this.min(tc[1] * tex_h, tex_clamp_y));
        let txIndex = 4 * (tcX + tcY * tex_w);
        let r = tx.pixels[txIndex];
        let g = tx.pixels[txIndex+1];
        let b = tx.pixels[txIndex+2];
        let index = 4 * (x + y * width);
        pixels[index] = r;
        pixels[index+1] = g;
        pixels[index+2] = b;
        pixels[index+3] = 255;
      }
    }
  }
  this.drawFlatTopTriangle = function(v0, v1, v2, c){
    //triangle(v0[0], v0[1], v1[0], v1[1], v2[0], v2[1]);
    let m0 = (v2[0] - v0[0]) / (v2[1] - v0[1]);
    let m1 = (v2[0] - v1[0]) / (v2[1] - v1[1]);
    
    let yStart = Math.ceil(v0[1] - 0.5);
    let yEnd = Math.ceil(v2[1] - 0.5);
    
    for(let y=yStart; y<yEnd; y++){
      //start and end points of line
      let px0 = m0 * (y + 0.5 - v0[1]) + v0[0];
      let px1 = m1 * (y + 0.5 - v1[1]) + v1[0];
      
      //start and end pixels of line
      let xStart = Math.ceil(px0 - 0.5);
      let xEnd = Math.ceil(px1 - 0.5);
      
      for(let x=xStart; x<xEnd; x++){
        let index = 4 * (x + y * width);
        pixels[index] = c.levels[0];
        pixels[index+1] = c.levels[1];
        pixels[index+2] = c.levels[2];
        pixels[index+3] = c.levels[3];
      }
    }
  }
  this.drawFlatBottomTriangle = function(v0, v1, v2, c){
    //triangle(v0[0], v0[1], v1[0], v1[1], v2[0], v2[1]);
    let m0 = (v1[0] - v0[0]) / (v1[1] - v0[1]);
    let m1 = (v2[0] - v0[0]) / (v2[1] - v0[1]);
    
    let yStart = Math.ceil(v0[1] - 0.5);
    let yEnd = Math.ceil(v2[1] - 0.5);
    
    for(let y=yStart; y<yEnd; y++){
      //start and end points of line
      let px0 = m0 * (y + 0.5 - v0[1]) + v0[0];
      let px1 = m1 * (y + 0.5 - v0[1]) + v0[0];
      
      //start and end pixels of line
      let xStart = Math.ceil(px0 - 0.5);
      let xEnd = Math.ceil(px1 - 0.5);
      
      for(let x=xStart; x<xEnd; x++){
        let index = 4 * (x + y * width);
        pixels[index] = c.levels[0];
        pixels[index+1] = c.levels[1];
        pixels[index+2] = c.levels[2];
        pixels[index+3] = c.levels[3];
      }
    }
  }
}
cam3.new = function(){
  return new Cam3();
}