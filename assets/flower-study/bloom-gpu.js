(() => {
  'use strict';
  function create(){
    const canvas=new OffscreenCanvas(520,600),gl=canvas.getContext('webgl',{alpha:true,antialias:false,stencil:true,premultipliedAlpha:true});
    if(!gl||!gl.getContextAttributes().stencil)return null;
    const shaders=[],programs=[];let lost=false;
    canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();lost=true;});
    function program(vertex,fragment){
      function compile(type,source){const shader=gl.createShader(type);gl.shaderSource(shader,source);gl.compileShader(shader);shaders.push(shader);return shader;}
      const p=gl.createProgram();gl.attachShader(p,compile(gl.VERTEX_SHADER,vertex));gl.attachShader(p,compile(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(p);programs.push(p);return p;
    }
    const position='uniform vec2 targetSize,tile;vec4 clip(vec2 p){vec2 px=tile+vec2(240.,220.)+p*2.;return vec4(px.x/targetSize.x*2.-1.,1.-px.y/targetSize.y*2.,0.,1.);}';
    const solid=program(`attribute vec2 position;${position}void main(){gl_Position=clip(position);}`,'precision mediump float;void main(){gl_FragColor=vec4(0.,0.,0.,1.);}');
    const dots=program(`precision highp float;attribute vec4 centre,tangent,detail;attribute float depth;
      uniform float opening,openness,bowl,extra;uniform mat3 view;uniform vec2 targetSize,tile;varying vec2 origin,extent;varying float alpha;
      void main(){float x0=centre.x+centre.y*opening,y0=centre.z+centre.w*opening;
        vec2 d=vec2(tangent.x+tangent.y*opening,tangent.z+tangent.w*opening)*bowl;float len=length(d);if(len==0.)len=1.;
        float w=detail.x*(.15+.85*openness);vec3 p=vec3(x0*bowl-d.y/len*w,y0*bowl+d.x/len*w+detail.y,depth*bowl+extra*x0+w*.18);
        vec2 q=(view*p).xy;origin=tile+vec2(240.,220.)+q*2.;extent=vec2(detail.w*2.,1.16);alpha=detail.z;
        vec2 middle=origin+extent*.5;gl_Position=vec4(middle.x/targetSize.x*2.-1.,1.-middle.y/targetSize.y*2.,0.,1.);gl_PointSize=4.;
      }`, `precision highp float;varying vec2 origin,extent;varying float alpha;uniform vec2 targetSize;
      void main(){vec2 p=vec2(gl_FragCoord.x,targetSize.y-gl_FragCoord.y);vec2 coverage=max(vec2(0.),min(p+.5,origin+extent)-max(p-.5,origin));
        float a=coverage.x*coverage.y*alpha;if(a<=0.)discard;gl_FragColor=vec4(vec3(.772549,.709804,.925490)*a,a);}`);
    const glyphs=program(`attribute vec2 position,uv;varying vec2 texcoord;${position}void main(){gl_Position=clip(position);texcoord=uv;}`,
      'precision mediump float;uniform sampler2D atlas;varying vec2 texcoord;void main(){gl_FragColor=texture2D(atlas,texcoord);}');
    const copy=program('attribute vec2 position;varying vec2 uv;void main(){gl_Position=vec4(position,0.,1.);uv=(position+1.)*.5;}','precision mediump float;uniform sampler2D image;varying vec2 uv;void main(){gl_FragColor=texture2D(image,uv);}');
    if(programs.some(p=>!gl.getProgramParameter(p,gl.LINK_STATUS))){gl.getExtension('WEBGL_lose_context')?.loseContext();return null;}
    shaders.forEach(s=>gl.deleteShader(s));
    const locations=new Map();function uniform(p,name){let u=locations.get(p);if(!u){u={};locations.set(p,u);}return u[name]??(u[name]=gl.getUniformLocation(p,name));}
    const shapeBuffer=gl.createBuffer(),glyphBuffer=gl.createBuffer();
    const enabled=new Set();function attributes(p,list){
      const needed=new Set(list.map(([name])=>gl.getAttribLocation(p,name)));
      for(const a of enabled)if(!needed.has(a)){gl.disableVertexAttribArray(a);enabled.delete(a);}
      for(const [name,buffer,size,stride=0,offset=0] of list){const a=gl.getAttribLocation(p,name);if(a<0)continue;gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.enableVertexAttribArray(a);enabled.add(a);gl.vertexAttribPointer(a,size,gl.FLOAT,false,stride,offset);}
    }
    const copyQuad=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,copyQuad);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
    const image=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,image);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
    const framebuffer=gl.createFramebuffer(),stencil=gl.createRenderbuffer();let width=0,height=0,states=[];
    const buffers=new Map();function textureBuffers(p,params){
      const key=JSON.stringify([p,params]);if(buffers.has(key))return buffers.get(key);
      const result=FlowerBloom.prepare(p,params).map(data=>{const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,data,gl.STATIC_DRAW);return {buffer,count:data.length/13};});
      buffers.set(key,result);if(buffers.size>16){const first=buffers.keys().next().value;buffers.get(first).forEach(item=>gl.deleteBuffer(item.buffer));buffers.delete(first);}return result;
    }
    const letters='.0123456789',atlasCanvas=new OffscreenCanvas(512,256),text=atlasCanvas.getContext('2d');
    text.fillStyle='#c5b5ec';text.textAlign='center';text.textBaseline='middle';
    for(let row=0;row<7;row++){const u=.12+row*.13;text.font=`${2*(5.5+u*2.5)}px Menlo,monospace`;for(let i=0;i<letters.length;i++)text.fillText(letters[i],i*24+12,row*24+12);}
    const atlas=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,atlas);gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,true);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,atlasCanvas);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
    function fan(points){const values=[];for(const q of points)values.push(q[0],q[1]);gl.useProgram(solid);gl.bindBuffer(gl.ARRAY_BUFFER,shapeBuffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(values),gl.STREAM_DRAW);attributes(solid,[['position',shapeBuffer,2]]);gl.drawArrays(gl.TRIANGLE_FAN,0,points.length);}
    // Preserve Canvas's nonzero fill rule, including the numeric cup's two contours.
    function mask(contours){
      gl.enable(gl.STENCIL_TEST);gl.stencilMask(255);gl.clear(gl.STENCIL_BUFFER_BIT);gl.colorMask(false,false,false,false);gl.stencilFunc(gl.ALWAYS,0,255);
      gl.stencilOpSeparate(gl.FRONT,gl.KEEP,gl.KEEP,gl.INCR_WRAP);gl.stencilOpSeparate(gl.BACK,gl.KEEP,gl.KEEP,gl.DECR_WRAP);
      for(const points of contours)fan(points);
      gl.colorMask(true,true,true,true);gl.stencilMask(0);gl.stencilFunc(gl.NOTEQUAL,0,255);gl.stencilOp(gl.KEEP,gl.KEEP,gl.KEEP);
      const points=contours.flat(),xs=points.map(q=>q[0]),ys=points.map(q=>q[1]),left=Math.min(...xs),right=Math.max(...xs),top=Math.min(...ys),bottom=Math.max(...ys);fan([[left,top],[right,top],[right,bottom],[left,bottom]]);
    }
    function renderTile(p,g,params,tile){
      for(const program of [solid,dots,glyphs]){gl.useProgram(program);gl.uniform2f(uniform(program,'targetSize'),width,height);gl.uniform2f(uniform(program,'tile'),tile[0],tile[1]);}
      gl.colorMask(true,true,true,true);gl.stencilMask(255);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT|gl.STENCIL_BUFFER_BIT);gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA);
      const s=FlowerBloom.geometry(p,g,params);if(!s)return [0,0];
      const prepared=textureBuffers(p,params),{cy,sy,ce,se,ct,st}=s;
      const view=new Float32Array([cy*ct-sy*se*st,cy*st+sy*se*ct,sy*ce,ce*st,-ce*ct,se,-sy*ct-cy*se*st,-sy*st+cy*se*ct,cy*ce]);
      function petal(item){
        mask([item.boundary]);gl.useProgram(dots);const b=prepared[item.j];attributes(dots,[['centre',b.buffer,4,52,0],['depth',b.buffer,1,52,16],['tangent',b.buffer,4,52,20],['detail',b.buffer,4,52,36]]);
        gl.uniformMatrix3fv(uniform(dots,'view'),false,view);gl.uniform1f(uniform(dots,'opening'),s.open*params.openness/.83);gl.uniform1f(uniform(dots,'openness'),s.open);gl.uniform1f(uniform(dots,'bowl'),s.bowl);gl.uniform1f(uniform(dots,'extra'),item.j>=11?(item.j-10)*.15:0);
        gl.drawArrays(gl.POINTS,0,b.count);gl.disable(gl.STENCIL_TEST);
      }
      s.petals.sort((a,b)=>a.z-b.z);s.petals.filter(q=>q.z<9).forEach(petal);
      const cupPoint=(u,a)=>{const radius=s.radius*(.08+.92*u**.85);return s.project([radius*Math.cos(a),-s.depth*(1-u),radius*Math.sin(a)]);};
      const outer=[],inner=[];for(let k=0;k<=30;k++)outer.push(cupPoint(1,k*Math.PI*2/30));for(let k=30;k>=0;k--)inner.push(cupPoint(0,k*Math.PI*2/30));mask([outer,inner]);gl.disable(gl.STENCIL_TEST);
      const vertices=[];for(let row=0;row<7;row++){
        const u=.12+row*.13,count=Math.max(3,Math.round(14*(.1+.9*u))),digits=u.toFixed(2).slice(1).repeat(4).slice(0,count);
        for(let k=0;k<digits.length;k++){
          const a=.12+(Math.PI-.24)*k/(digits.length-1),q=cupPoint(u,a),sx=.45+.55*Math.sin(a),col=letters.indexOf(digits[k]);
          for(const [x,y] of [[-1,-1],[1,-1],[-1,1],[-1,1],[1,-1],[1,1]])vertices.push(q[0]+x*6*sx,q[1]+y*6,(col*24+(x+1)*12)/512,(row*24+(y+1)*12)/256);
        }
      }
      gl.useProgram(glyphs);gl.bindBuffer(gl.ARRAY_BUFFER,glyphBuffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(vertices),gl.STREAM_DRAW);attributes(glyphs,[['position',glyphBuffer,2,16,0],['uv',glyphBuffer,2,16,8]]);gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,atlas);gl.uniform1i(uniform(glyphs,'atlas'),0);gl.drawArrays(gl.TRIANGLES,0,vertices.length/4);
      s.petals.filter(q=>q.z>=9).forEach(petal);return s.anchor;
    }
    // transferToImageBitmap clears the default framebuffer. Keep completed tiles
    // in a stencil-backed FBO so only changing blooms need to be rasterized.
    function renderBatch(items,params){
      if(lost||gl.isContextLost())return null;
      const columns=Math.min(4,items.length),W=columns*480,H=Math.ceil(items.length/columns)*400;
      if(W!==width||H!==height){width=W;height=H;canvas.width=W;canvas.height=H;states=[];gl.bindTexture(gl.TEXTURE_2D,image);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,W,H,0,gl.RGBA,gl.UNSIGNED_BYTE,null);gl.bindFramebuffer(gl.FRAMEBUFFER,framebuffer);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,image,0);gl.bindRenderbuffer(gl.RENDERBUFFER,stencil);gl.renderbufferStorage(gl.RENDERBUFFER,gl.STENCIL_INDEX8,W,H);gl.framebufferRenderbuffer(gl.FRAMEBUFFER,gl.STENCIL_ATTACHMENT,gl.RENDERBUFFER,stencil);if(gl.checkFramebufferStatus(gl.FRAMEBUFFER)!==gl.FRAMEBUFFER_COMPLETE)throw new Error("Incomplete bloom atlas");}
      gl.bindFramebuffer(gl.FRAMEBUFFER,framebuffer);gl.viewport(0,0,width,height);gl.enable(gl.SCISSOR_TEST);
      const frames=items.map((item,index)=>{
        const tile=[index%columns*480,Math.floor(index/columns)*400,480,400],key=JSON.stringify([item.plant,params]);let state=states[index];
        if(!state||state.key!==key||state.stage!==item.stage){gl.scissor(tile[0],height-tile[1]-400,480,400);const anchor=renderTile(item.plant,item.stage,params,tile);state=states[index]={key,stage:item.stage,anchor};}
        return {id:item.plant.id,stage:item.stage,anchor:state.anchor,tile};
      });
      gl.disable(gl.SCISSOR_TEST);gl.disable(gl.STENCIL_TEST);gl.disable(gl.BLEND);gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.viewport(0,0,width,height);gl.colorMask(true,true,true,true);gl.useProgram(copy);attributes(copy,[['position',copyQuad,2]]);gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,image);gl.uniform1i(uniform(copy,'image'),0);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
      return {canvas,frames};
    }
    return {renderBatch};
  }
  self.FlowerBloomGPU={create(){try{return create();}catch{return null;}}};
})();
