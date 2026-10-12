(() => {
  const canvas=document.querySelector('[data-flower-sway]') || document.querySelector('canvas'),gl=canvas.getContext('webgl',{alpha:false,antialias:false,preserveDrawingBuffer:true}),button=document.querySelector('[data-flower-pause]');
  const image=new Image(),reduce=matchMedia('(prefers-reduced-motion: reduce)');
  let raf=null,last=null,time=0,paused=false,visible=true,ready=false;
  const margin=24,flushBottom=canvas.hasAttribute('data-flush-bottom'),field=canvas.hasAttribute('data-flower-field'),narrow=matchMedia('(max-width:600px)');
  const imageURL=new URL('flowers.png',document.currentScript.src).href;
  let program,positionBuffer,indexBuffer,indexCount;
  // Each region follows a petal or leaf from its attachment to its tip.
  // Periods and phases differ, giving continuous, unsynchronised movement.
  const regions=[
    [255,281,75,262,39,.035,0,2.7], [255,281,230,198,30,.045,1.2,2.2],
    [272,281,355,219,29,.04,2.7,3.1], [289,288,457,312,38,.038,4,2.5],
    [540,214,492,91,31,.04,.7,2.6], [550,218,582,110,35,.035,2,3.3],
    [581,241,739,218,28,.045,4.5,2.4],
    [534,445,469,383,28,.045,1.6,2.3], [547,451,658,423,30,.035,3.2,2.9],
    [843,738,759,639,40,.035,2.4,3.1], [866,746,955,684,37,.035,4.7,2.6],
    [1009,807,1122,849,27,.04,1.3,2.1],
    [274,562,96,465,50,.035,.8,3.5], [326,805,471,634,28,.035,3.5,3.2],
    [440,1207,290,1284,40,.04,5.2,3.8], [978,895,1062,941,35,.045,2.1,2.8]
  ];
  function shader(type,source){const sh=gl.createShader(type);gl.shaderSource(sh,source);gl.compileShader(sh);if(!gl.getShaderParameter(sh,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(sh));return sh}
  function setup(){
    if(!gl)throw new Error('WebGL is required for this flower study');
    program=gl.createProgram();
    gl.attachShader(program,shader(gl.VERTEX_SHADER,`
      attribute vec2 point; varying vec2 uv;
      uniform vec2 size; uniform vec2 frameSize; uniform vec4 placement; uniform float time; uniform float motion;
      uniform vec4 regions[16]; uniform vec4 settings[16];
      void main(){
        uv=point;vec2 source=point*size,p=source;
        for(int i=0;i<16;i++){
          vec2 base=regions[i].xy,axis=regions[i].zw-base;
          float len=length(axis);vec2 dir=axis/len,offset=source-base;
          float along=dot(offset,dir)/len;
          float side=abs(offset.x*dir.y-offset.y*dir.x)/settings[i].x;
          float weight=smoothstep(0.0,.4,along)*(1.0-smoothstep(.85,1.3,along))*(1.0-smoothstep(.3,1.0,side));
          float phase=time*6.2831853/settings[i].w+settings[i].z;
          float angle=motion*settings[i].y*(sin(phase)+.18*sin(phase*1.71+1.0));
          vec2 rotated=vec2(cos(angle)*offset.x-sin(angle)*offset.y,sin(angle)*offset.x+cos(angle)*offset.y);
          p+=(rotated-offset)*weight;
        }
        float u=1.0-source.y/size.y,phase=time*6.2831853/8.0;
        p.x+=motion*pow(u,1.65)*(16.0*sin(phase-.45*u)+3.0*sin(2.0*phase-.8*u));
        vec2 screen=((p+24.0)/frameSize)*placement.zw+placement.xy;
        gl_Position=vec4(screen.x*2.0-1.0,1.0-screen.y*2.0,0,1);
      }`));
    gl.attachShader(program,shader(gl.FRAGMENT_SHADER,`precision mediump float;varying vec2 uv;uniform sampler2D artwork;void main(){vec4 color=texture2D(artwork,uv);if(max(color.r,max(color.g,color.b))<.04)discard;gl_FragColor=color;}`));
    gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(program));gl.useProgram(program);
    const vertices=[],indices=[],cols=150,rows=180;
    for(let y=0;y<=rows;y++)for(let x=0;x<=cols;x++)vertices.push(x/cols,y/rows);
    for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){const a=y*(cols+1)+x,b=a+cols+1;indices.push(a,b,a+1,a+1,b,b+1)}
    positionBuffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,positionBuffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(vertices),gl.STATIC_DRAW);
    const loc=gl.getAttribLocation(program,'point');gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);
    indexBuffer=gl.createBuffer();gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,indexBuffer);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(indices),gl.STATIC_DRAW);indexCount=indices.length;
    gl.uniform2f(gl.getUniformLocation(program,'size'),image.width,image.height);
    gl.uniform2f(gl.getUniformLocation(program,'frameSize'),image.width+48,image.height+(flushBottom?margin-16:margin*2));
    gl.uniform4fv(gl.getUniformLocation(program,'regions[0]'),new Float32Array(regions.flatMap(r=>r.slice(0,4))));
    gl.uniform4fv(gl.getUniformLocation(program,'settings[0]'),new Float32Array(regions.flatMap(r=>r.slice(4))));
    const texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);
    gl.viewport(0,0,canvas.width,canvas.height);gl.clearColor(0,0,0,1);
  }
  function draw(ms){
    gl.clear(gl.COLOR_BUFFER_BIT);gl.uniform1f(gl.getUniformLocation(program,'motion'),reduce.matches?0:1);
    const placements=field?(narrow.matches?[[0,.48],[.25,.5],[.5,.48]]:[[0,.24],[.18,.26],[.37,.23],[.55,.25],[.74,.26]]):[[0,1]];
    placements.forEach(([left,width],i)=>{
      const height=field?width/(narrow.matches?.5:.26):1;
      gl.uniform4f(gl.getUniformLocation(program,'placement'),left,1-height,width,height);
      gl.uniform1f(gl.getUniformLocation(program,'time'),ms/1000*(1+i*.037)+i*2.19);
      gl.drawElements(gl.TRIANGLES,indexCount,gl.UNSIGNED_SHORT,0);
    });
  }
  function dimensions(){canvas.width=field?(narrow.matches?900:1800):image.width+margin*2;canvas.height=field?Math.ceil(canvas.width*(image.height+8)/(image.width+48)*(narrow.matches?.5:.26)):image.height+(flushBottom?margin-16:margin*2)}
  narrow.addEventListener('change',()=>{if(ready&&field){dimensions();gl.viewport(0,0,canvas.width,canvas.height);draw(time)}});
  function stop(){if(raf!==null)cancelAnimationFrame(raf);raf=null;last=null}
  function tick(now){if(last!==null)time+=now-last;last=now;draw(time);raf=requestAnimationFrame(tick)}
  function start(){stop();if(ready&&visible&&!paused&&!document.hidden&&!reduce.matches)raf=requestAnimationFrame(tick)}
  button?.addEventListener('click',()=>{paused=!paused;button.textContent=paused?'play':'pause';button.setAttribute('aria-pressed',String(paused));start()});
  document.addEventListener('visibilitychange',start);
  reduce.addEventListener('change',()=>{time=0;if(ready)draw(0);start()});
  new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;start()}).observe(canvas);
  image.onload=()=>{if(!gl){image.alt=canvas.getAttribute('aria-label');image.style.cssText='display:block;width:100%;height:auto';canvas.replaceWith(image);if(button)button.hidden=true;return}dimensions();setup();ready=true;draw(0);start()};
  image.src=imageURL;
})();
