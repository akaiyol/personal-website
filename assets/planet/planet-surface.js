// GPU version of mockups/planet-colour-study's geometry and Braille lattice.
// No clock or input handlers: planet.js owns motion and lifecycle.
export function createPlanetSurface(canvas,onReady){
  const gl=canvas.getContext('webgl',{alpha:true,premultipliedAlpha:true,antialias:false,preserveDrawingBuffer:true});
  if(!gl)return null;
  const view=`uniform vec2 size,centre;uniform float radius,phase;uniform vec3 bx,by,bz;
    vec3 project(vec3 p){return vec3(bx.x*p.x+by.x*p.y+bz.x*p.z,bx.y*p.x+by.y*p.y+bz.y*p.z,bx.z*p.x+by.z*p.y+bz.z*p.z);}
    vec2 clip(vec2 p){return vec2(p.x/size.x*2.-1.,1.-p.y/size.y*2.);}`;
  const fullscreen='attribute vec2 position;void main(){gl_Position=vec4(position,0.,1.);}';
  const stripVertex=`precision highp float;attribute vec3 data;${view}uniform float kind;varying float depth,angle,band;
    vec3 world(float a,float b){if(kind<.5){float r=1.22+b*.022+(b>14.?.075:0.)+(b>25.?.035:0.);return vec3(r*cos(a),0.,r*sin(a));}float lat=.24+b*.019+.075*sin((a-phase)*3.+b*.08);return vec3(cos(lat)*cos(a),sin(lat),cos(lat)*sin(a));}
    void main(){angle=data.x;band=data.y;vec3 q=project(world(angle,band)),next=project(world(angle+.0005,band));vec2 tangent=normalize(next.xy-q.xy);vec2 p=centre+q.xy*radius+vec2(-tangent.y,tangent.x)*data.z*.7;gl_Position=vec4(clip(p),0.,1.);depth=q.z;}`;
  const stripFragment=`precision highp float;uniform float phase,front,kind;varying float depth,angle,band;void main(){if(kind<.5){if((depth>=0.)!=(front>.5)||sin((angle-phase)*2.+band*.065)>.997)discard;}else{if(depth<=0.||sin((angle-phase)*2.+band*.065)>=.988)discard;}gl_FragColor=vec4(1.);}`;
  const grainVertex=`precision highp float;attribute vec3 point;attribute vec3 detail;${view}varying float value,visible;void main(){vec3 q=project(point);float cloud=.5+.24*sin(detail.x*13.+sin((detail.y-phase)*3.)*1.2)+.16*sin(detail.x*31.-(detail.y-phase)*5.);float light=clamp(.12+q.x*.29-q.y*.48+q.z*.36,0.,1.);float fade=clamp((.65-q.y)*1.25,0.,1.);visible=q.z>.025&&detail.z<=.35+light*.5*fade&&cloud>=.26?1.:0.;value=(.55+light*.45)*(.18+fade*.82);gl_Position=vec4(clip(centre+q.xy*radius),0.,1.);gl_PointSize=2.*(1.1+q.z*.85);}`;
  const grainFragment=`precision highp float;varying float value,visible;void main(){if(visible<.5||length(gl_PointCoord-.5)>.5)discard;gl_FragColor=vec4(vec3(value),1.);}`;
  const discFragment=`precision highp float;uniform vec2 size,centre;uniform float radius,rim;void main(){vec2 p=vec2(gl_FragCoord.x,size.y-gl_FragCoord.y);float d=length(p-centre);if(rim>.5){if(abs(d-radius)>.5)discard;gl_FragColor=vec4(1.);}else{if(d>radius)discard;gl_FragColor=vec4(0.,0.,0.,1.);}}`;
  const dotsFragment=`precision highp float;uniform sampler2D scene;uniform vec2 size;uniform float dpr,stepSize,dotRadius;
    float node(float p,float n,float gap){float period=n*stepSize+gap;float block=floor((p-1.)/period),local=p-1.-block*period;float index=floor(local/stepSize+.5);return 1.+(index>=n?(block+1.)*period:block*period+index*stepSize);}
    float sampleInk(vec2 p){return texture2D(scene,vec2(p.x/size.x,1.-p.y/size.y)).r;}
    void main(){vec2 p=vec2(gl_FragCoord.x,size.y*dpr-gl_FragCoord.y)/dpr;vec2 dotCentre=vec2(node(p.x,2.,.75),node(p.y,4.,.9));float ink=sampleInk(dotCentre);ink=max(ink,sampleInk(dotCentre+vec2(1.,0.)));ink=max(ink,sampleInk(dotCentre-vec2(1.,0.)));ink=max(ink,sampleInk(dotCentre+vec2(0.,1.)));ink=max(ink,sampleInk(dotCentre-vec2(0.,1.)));if(ink<.102)discard;float a=1.-smoothstep(dotRadius-.35/dpr,dotRadius+.35/dpr,length(p-dotCentre));if(a<=0.)discard;gl_FragColor=vec4(vec3(.772549,.709804,.925490)*ink*a,a);}`;
  function program(v,f){function shader(type,source){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;}const p=gl.createProgram();gl.attachShader(p,shader(gl.VERTEX_SHADER,v));gl.attachShader(p,shader(gl.FRAGMENT_SHADER,f));gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(p));return p;}
  const starVertex=`precision highp float;attribute vec3 data;uniform vec2 size;uniform float dpr;void main(){gl_Position=vec4(data.x/size.x*2.-1.,1.-data.y/size.y*2.,0.,1.);gl_PointSize=max(1.,data.z*2.*dpr);}`;
  const starFragment=`precision highp float;void main(){float a=1.-smoothstep(.32,.5,length(gl_PointCoord-.5));gl_FragColor=vec4(vec3(.772549,.709804,.925490)*a,a);}`;
  let strips,grain,disc,dots,starProgram;try{starProgram=program(starVertex,starFragment);strips=program(stripVertex,stripFragment);grain=program(grainVertex,grainFragment);disc=program(fullscreen,discFragment);dots=program(fullscreen,dotsFragment);}catch{gl.getExtension('WEBGL_lose_context')?.loseContext();return null;}
  const buffer=(values)=>{const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(values),gl.STATIC_DRAW);return b;};
  const starBuffer=buffer([]);
  const quad=buffer([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]);
  const paths=[];for(let band=0;band<34;band++){if(band>0)paths.push(Math.PI*2,band-1,1,0,band,-1);for(let k=0;k<=540;k++)for(const side of [-1,1])paths.push(k/540*Math.PI*2,band,side);}
  const pathBuffer=buffer(paths),points=[];
  for(let lat=-76;lat<=78;lat+=.95)for(let lon=0;lon<360;lon+=.95){const v=lat*Math.PI/180,a=lon*Math.PI/180;points.push(Math.cos(v)*Math.cos(a),Math.sin(v),Math.cos(v)*Math.sin(a),v,a,Math.abs((Math.sin(lat*127.1+lon*311.7)*43758.5453)%1));}
  const grainBuffer=buffer(points),count=points.length/6;
  const texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
  const framebuffer=gl.createFramebuffer();let sourceWidth=0,sourceHeight=0,lost=false;
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();lost=true;onReady();});
  const locations=new Map();function uniform(p,name){let cache=locations.get(p);if(!cache){cache={};locations.set(p,cache);}if(!(name in cache))cache[name]=gl.getUniformLocation(p,name);return cache[name];}
  function attr(p,name,b,size,stride=0,offset=0){gl.bindBuffer(gl.ARRAY_BUFFER,b);const a=gl.getAttribLocation(p,name);gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,size,gl.FLOAT,false,stride,offset);}
  function setup(p,s){gl.useProgram(p);gl.uniform2f(uniform(p,'size'),s.width,s.height);gl.uniform2f(uniform(p,'centre'),s.cx,s.cy);gl.uniform1f(uniform(p,'radius'),s.radius);gl.uniform1f(uniform(p,'phase'),s.phase);for(const name of ['bx','by','bz'])gl.uniform3fv(uniform(p,name),s[name]);}
  function ringPass(s,front){setup(strips,s);attr(strips,'data',pathBuffer,3);gl.uniform1f(uniform(strips,'kind'),0);gl.uniform1f(uniform(strips,'front'),front);gl.drawArrays(gl.TRIANGLE_STRIP,0,34*1082+33*2);}
  return {draw(s){if(lost||gl.isContextLost())return null;const W=Math.round(s.width*s.dpr),H=Math.round(s.height*s.dpr);if(canvas.width!==W||canvas.height!==H){canvas.width=W;canvas.height=H;}
    if(sourceWidth!==s.width||sourceHeight!==s.height){sourceWidth=s.width;sourceHeight=s.height;gl.bindTexture(gl.TEXTURE_2D,texture);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,s.width,s.height,0,gl.RGBA,gl.UNSIGNED_BYTE,null);gl.bindFramebuffer(gl.FRAMEBUFFER,framebuffer);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,texture,0);}
    gl.disable(gl.BLEND);gl.bindFramebuffer(gl.FRAMEBUFFER,framebuffer);gl.viewport(0,0,s.width,s.height);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);
    ringPass(s,0);setup(disc,s);attr(disc,'position',quad,2);gl.uniform1f(uniform(disc,'rim'),0);gl.drawArrays(gl.TRIANGLES,0,6);
    setup(grain,s);attr(grain,'point',grainBuffer,3,24,0);attr(grain,'detail',grainBuffer,3,24,12);gl.drawArrays(gl.POINTS,0,count);
    setup(strips,s);attr(strips,'data',pathBuffer,3);gl.uniform1f(uniform(strips,'kind'),1);gl.drawArrays(gl.TRIANGLE_STRIP,0,29*1082+28*2);
    setup(disc,s);attr(disc,'position',quad,2);gl.uniform1f(uniform(disc,'rim'),1);gl.drawArrays(gl.TRIANGLES,0,6);ringPass(s,1);
    gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.viewport(0,0,W,H);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA);
    gl.useProgram(starProgram);const starPoints=[];for(const star of s.stars)starPoints.push(star.x,star.y,star.size);
    gl.bindBuffer(gl.ARRAY_BUFFER,starBuffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(starPoints),gl.DYNAMIC_DRAW);attr(starProgram,'data',starBuffer,3);gl.uniform2f(uniform(starProgram,'size'),s.width,s.height);gl.uniform1f(uniform(starProgram,'dpr'),s.dpr);gl.drawArrays(gl.POINTS,0,s.stars.length);
    gl.useProgram(dots);attr(dots,'position',quad,2);gl.bindTexture(gl.TEXTURE_2D,texture);gl.uniform2f(uniform(dots,'size'),s.width,s.height);gl.uniform1f(uniform(dots,'dpr'),s.dpr);gl.uniform1f(uniform(dots,'stepSize'),s.width<=600?3:3.2);gl.uniform1f(uniform(dots,'dotRadius'),s.width<=600?.82:.95);gl.drawArrays(gl.TRIANGLES,0,6);return canvas;
  }};
}
