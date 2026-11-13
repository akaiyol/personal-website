import { makeRenderer } from './lumen/render.js';
(async () => {
  'use strict';
  const canvas=document.querySelector('#home-planet'), hero=document.querySelector('.hero');
  for(const link of document.querySelectorAll('a[href^="#"]'))link.href=location.href.split('#')[0]+link.getAttribute('href');
  const ctx=canvas.getContext('2d'), surface=document.createElement('canvas'), paint=surface.getContext('2d',{willReadFrequently:true});
  const reduce=matchMedia('(prefers-reduced-motion: reduce)'),TAU=Math.PI*2;
  const startPose=Object.freeze({pitch:-1.40,roll:.32}),restPose=Object.freeze({pitch:.40,roll:.32});
  let width=0,height=0,phase=0,pitch=reduce.matches?restPose.pitch:startPose.pitch,roll=restPose.roll,yaw=0,raf=null,last=null,lastPaint=0,drag=null,inView=true;
  let introElapsed=0, introRunning=!reduce.matches, introState=reduce.matches?'complete':'running';
  function finishIntro(reason='complete') {introRunning=false;introState=reason;if(reason==='complete'){roll=restPose.roll;pitch=restPose.pitch;}hoverAt(pointer);}
  const hint=document.createElement('span');hint.id='planet-drag-hint';hint.textContent='[ drag ↔ ]';hint.hidden=true;hint.setAttribute('aria-hidden','true');canvas.after(hint);
  let pointer=null,hoverYaw=0,hoverPitch=0,targetYaw=0,targetPitch=0,hasDragged=false;
  function hoverAt(point){
    pointer=point;
    if(!point||introRunning||drag||hero.hidden){targetYaw=targetPitch=0;hint.hidden=true;return}
    const r=width>700?Math.max(width*.34,height*.58):width*.78,cx=width-r*.16,cy=height*.55;
    const dx=(point.x-cx)/r,dy=(point.y-cy)/r;
    const x=dx*Math.cos(roll)-dy*Math.sin(roll),y=-(dx*Math.sin(roll)+dy*Math.cos(roll));
    const ring=Math.abs(Math.sin(pitch))>.06?Math.hypot(x,y/Math.sin(pitch)):Infinity;
    const hit=dx*dx+dy*dy<=1||(ring>=1.15&&ring<=2.12);
    targetYaw=hit&&!reduce.matches?.025+clamp(dx*.016,-.016,.016):0;
    targetPitch=hit&&!reduce.matches?-.017+clamp(dy*.016,-.016,.016):0;
    hint.hidden=!hit||hasDragged;
    hint.style.left=Math.min(width-106,Math.max(8,point.x+16))+'px';
    hint.style.top=Math.min(height-30,Math.max(8,point.y+18))+'px';
  }
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  function project(x,y,z){
    const viewYaw=yaw+hoverYaw,viewPitch=pitch+hoverPitch;
    const X=x*Math.cos(viewYaw)-z*Math.sin(viewYaw),Z=x*Math.sin(viewYaw)+z*Math.cos(viewYaw);
    const Y=y*Math.cos(viewPitch)-Z*Math.sin(viewPitch),depth=y*Math.sin(viewPitch)+Z*Math.cos(viewPitch);
    return [X*Math.cos(roll)-Y*Math.sin(roll),-(X*Math.sin(roll)+Y*Math.cos(roll)),depth];
  }
  // Seed once: irregular gaps and sizes stay fixed while the sky rotates.
  let starSeed=0x51A7C0DE;
  function starRandom(){
    starSeed=(starSeed+0x6D2B79F5)>>>0;
    let n=starSeed;
    n=Math.imul(n^(n>>>15),n|1);
    n^=n+Math.imul(n^(n>>>7),n|61);
    return ((n^(n>>>14))>>>0)/4294967296;
  }
  const stars=Array.from({length:960},(_,id)=>{
    const y=1-2*starRandom(),a=starRandom()*TAU,r=Math.sqrt(1-y*y);
    return {id,x:r*Math.cos(a),y,z:r*Math.sin(a),size:.5+Math.pow(starRandom(),2)*1.05};
  });
  function drawStars(cx,cy,radius){
    const visible=[],focal=Math.max(width,height)*.65,turn=Math.cos(phase),spin=Math.sin(phase);
    for(const star of stars){
      const q=project(star.x*turn-star.z*spin,star.y,star.x*spin+star.z*turn);
      if(q[2]<=.12)continue;
      const x=width*.5+q[0]/q[2]*focal,y=height*.5+q[1]/q[2]*focal;
      if(x<2||x>width-2||y<2||y>height-2||Math.hypot(x-cx,y-cy)<radius+3)continue;
      ctx.beginPath();ctx.arc(x,y,star.size,0,TAU);ctx.fill();
      visible.push({id:star.id,x:+x.toFixed(3),y:+y.toFixed(3)});
    }
    canvas.dataset.stars=JSON.stringify(visible);
  }
  // Full-colour source material, followed by the reference renderer itself.
  const material=new URLSearchParams(location.search).get('material')||'prism';
  const ramps={
    prism:['#292553','#435c91','#51aab3','#a1d2bb','#f3ddb7','#f5b779','#db777f','#ad5298','#7959a5','#d2b2d2','#f8e8d1'],
    opal:['#243b65','#417498','#65b4bb','#aad6c5','#e9e8cc','#dcb696','#c28ba3','#a0a5cb','#d9d4db','#faf1d9'],
    solar:['#382a71','#784ca7','#c957af','#ec78a0','#f4a37e','#f9cf86','#fff0c1','#d4c2d5','#a684c5','#edd4d3']
  };
  const ramp=(ramps[material]||ramps.prism).map(c=>[1,3,5].map(i=>parseInt(c.slice(i,i+2),16)));
  const textureW=1536,textureH=768,texture=new Uint8ClampedArray(textureW*textureH*3);
  function colour(t){t=clamp(t,0,.9999)*(ramp.length-1);const i=Math.floor(t),f=t-i;return ramp[i].map((c,k)=>c+(ramp[i+1][k]-c)*f);}
  // Voyager map: photographic cloud structure, with expressive colour grading.
  // Source: JPL/Caltech, David Seal, https://space.jpl.nasa.gov/tmaps/jupiter.html
  const sourceMap=new Image();sourceMap.src=new URL('./jupiter-voyager.jpg',import.meta.url).href;
  await sourceMap.decode();
  const mapSurface=document.createElement('canvas');mapSurface.width=textureW;mapSurface.height=textureH;
  const mapPaint=mapSurface.getContext('2d',{willReadFrequently:true});mapPaint.drawImage(sourceMap,0,0,textureW,textureH);
  const mapPixels=mapPaint.getImageData(0,0,textureW,textureH).data;
  for(let y=0;y<textureH;y++)for(let x=0;x<textureW;x++){
    const i=(y*textureW+x)*3,j=(y*textureW+x)*4,v=y/textureH;
    const red=mapPixels[j]/255,green=mapPixels[j+1]/255,blue=mapPixels[j+2]/255;
    const luminance=.2126*red+.7152*green+.0722*blue;
    const tone=clamp((luminance-.15)/.70,0,1);
    const c=colour(clamp(.14+(1-tone)*.64+(v-.5)*.20,0,1));
    const filament=Math.pow(tone,4)*.54;
    for(let k=0;k<3;k++)texture[i+k]=(c[k]*(1-filament)+[252,237,220][k]*filament)*(.50+tone*.65);
  }
  let renderState=null;
  const outputSurface=document.createElement('canvas'),outputPaint=outputSurface.getContext('2d');
  function draw(){
    if(!width||!height)return;
    const radius=width>700?Math.max(width*.34,height*.58):width*.78;
    const cx=width-radius*.16,cy=height*.55;
    const cell=width<=600?3:4,w=Math.ceil(width/cell),h=Math.ceil(height/cell);
    if(!renderState||renderState.w!==w||renderState.h!==h||renderState.cell!==cell){
      const renderer=makeRenderer(w,h,cell,{mode:'original',chLevels:6,look:'led',algorithm:'bayer4',strength:.75,threshold:128,brightness:0,contrast:3,gamma:1,saturation:10,bg:[0,0,0],glow:.22,glowSize:1.3,twinkle:0});
      outputSurface.width=renderer.W;outputSurface.height=renderer.H;
      renderState={w,h,cell,renderer,source:new Uint8ClampedArray(w*h*4),image:outputPaint.createImageData(renderer.W,renderer.H)};
    }
    const {renderer,source,image}=renderState;
    source.fill(0);
    const bx=project(1,0,0),by=project(0,1,0),bz=project(0,0,1);
    const light=[-.60,-.65,.35];
    const L=[bx[0]*light[0]+bx[1]*light[1]+bx[2]*light[2],by[0]*light[0]+by[1]*light[1]+by[2]*light[2],bz[0]*light[0]+bz[1]*light[1]+bz[2]*light[2]];
    const cp=Math.cos(phase),sp=Math.sin(phase);
    const inv=(u,v,z)=>[bx[0]*u+bx[1]*v+bx[2]*z,by[0]*u+by[1]*v+by[2]*z,bz[0]*u+bz[1]*v+bz[2]*z];
    for(let y=0;y<h;y++)for(let x=0;x<w;x++){
      const u=((x+.5)*cell-cx)/radius,v=((y+.5)*cell-cy)/radius,r2=u*u+v*v;
      let rgb=[0,0,0],globeZ=-Infinity;
      if(r2<1){
        const z=globeZ=Math.sqrt(1-r2),P=inv(u,v,z);
        const tx=P[0]*cp+P[2]*sp,tz=-P[0]*sp+P[2]*cp;
        const lon=(Math.atan2(tz,tx)/TAU+1)%1,lat=Math.acos(clamp(P[1],-1,1))/Math.PI;
        const ix=Math.min(textureW-1,Math.floor(lon*textureW)),iy=Math.min(textureH-1,Math.floor(lat*textureH)),i=(iy*textureW+ix)*3;
        const diffuse=Math.max(0,u*light[0]+v*light[1]+z*light[2]);
        let illumination=.035+.78*Math.pow(diffuse,.90);
        const t=-P[1]/L[1];
        if(t>0){const rx=P[0]+t*L[0],rz=P[2]+t*L[2],rr=Math.hypot(rx,rz);if(rr>1.22&&rr<2.05)illumination*=.44;}
        const rim=Math.pow(1-z,4)*Math.max(0,.3+u*light[0]+v*light[1])*.65;
        rgb=[texture[i]*illumination+rim*85,texture[i+1]*illumination+rim*155,texture[i+2]*illumination+rim*240];
      }
      // Intersect the same equatorial ring plane used by the original projection.
      const rz=Math.abs(by[2])>.004?-(by[0]*u+by[1]*v)/by[2]:Infinity;
      const ringR=Math.sqrt(r2+rz*rz);
      if(ringR>=1.22&&ringR<=2.05&&rz>globeZ){
        const P=inv(u,v,rz),a=Math.atan2(P[2],P[0])-phase;
        const radial=(ringR-1.22)/.83;
        const filaments=.75+.15*Math.sin(ringR*760)+.08*Math.sin(ringR*1510)+.06*Math.sin(ringR*190+a*5);
        let opacity=filaments;
        if((ringR>1.535&&ringR<1.595)||(ringR>1.895&&ringR<1.925))opacity*=.10;
        opacity*=Math.min(1,(ringR-1.22)*50,(2.05-ringR)*50);
        const b=P[0]*L[0]+P[1]*L[1]+P[2]*L[2];
        const shadow=b<0&&ringR*ringR-b*b<1;
        const ringLight=shadow?.08:.54+.12*Math.abs(by[0]*light[0]+by[1]*light[1]+by[2]*light[2]);
        // Mineral ice and dust differ from the atmosphere; narrow iridescent seams stay subordinate.
        const mineral=.5+.3*Math.sin(radial*8)+.1*Math.sin(radial*73);
        const c=[193+mineral*39,170+mineral*36,161+mineral*39];
        const iridescence=.12*Math.pow(.5+.5*Math.sin(radial*39),6);
        const accent=colour(.18+radial*.64);
        const R=c.map((n,k)=>(n*(1-iridescence)+accent[k]*iridescence)*ringLight);
        rgb=rgb.map((n,k)=>n*(1-opacity)+R[k]*opacity);
      }
      const i=(y*w+x)*4;source[i]=rgb[0];source[i+1]=rgb[1];source[i+2]=rgb[2];source[i+3]=255;
    }
    renderer.run(source);renderer.paint(image.data,phase/TAU*64);outputPaint.putImageData(image,0,0);
    const dpr=Math.min(devicePixelRatio||1,2);ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,width,height);
    ctx.fillStyle='#c5b5ec';drawStars(cx,cy,radius);
    ctx.imageSmoothingEnabled=false;ctx.globalCompositeOperation='screen';ctx.drawImage(outputSurface,0,0);ctx.globalCompositeOperation='source-over';
    canvas.dataset.phase=phase.toFixed(5);canvas.dataset.rotation=[yaw,pitch,roll].map(v=>v.toFixed(4)).join(',');
    canvas.dataset.intro=introState;canvas.dataset.hover=[hoverYaw,hoverPitch].map(v=>v.toFixed(5)).join(',');
    canvas.dataset.frame=String(Number(canvas.dataset.frame||0)+1);
  }

  function active(){return !hero.hidden&&!document.hidden&&inView}
  function frame(now){
    raf=null;if(!active()){last=null;return}
    if(last!==null&&!reduce.matches){
      const dt=now-last;const easeHover=1-Math.exp(-dt/140);hoverYaw+=(targetYaw-hoverYaw)*easeHover;hoverPitch+=(targetPitch-hoverPitch)*easeHover;phase=(phase+dt/1000*TAU/64)%TAU;
      if(introRunning){
        introElapsed+=dt;
        const t=clamp((introElapsed-180)/(3000/1.3),0,1),ease=t*t*t*(t*(t*6-15)+10);
        roll=startPose.roll+(restPose.roll-startPose.roll)*ease;pitch=startPose.pitch+(restPose.pitch-startPose.pitch)*ease;
        if(t===1)finishIntro();
      }
    }
    last=now;if(now-lastPaint>50){draw();lastPaint=now}
    if(!reduce.matches)raf=requestAnimationFrame(frame);
  }
  function update(){
    if(raf!==null)cancelAnimationFrame(raf);raf=null;last=null;
    if(introRunning&&(reduce.matches||hero.hidden))finishIntro();
    if(hero.hidden){hoverAt(null);hoverYaw=hoverPitch=0;}
    if(reduce.matches){hoverYaw=hoverPitch=0;hoverAt(pointer);}
    if(active()){resize();hoverAt(pointer);draw();if(!reduce.matches)raf=requestAnimationFrame(frame)}
  }
  function resize(){if(hero.hidden)return;width=Math.round(canvas.clientWidth);height=Math.round(canvas.clientHeight);const dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);surface.width=width;surface.height=height}
  canvas.addEventListener('pointerdown',e=>{if(e.button!==0)return;if(introRunning)finishIntro('interrupted');drag={id:e.pointerId,x:e.clientX,y:e.clientY,startX:e.clientX,startY:e.clientY};targetYaw=targetPitch=hoverYaw=hoverPitch=0;canvas.setPointerCapture(e.pointerId);canvas.classList.add('is-dragging')});
  canvas.addEventListener('pointermove',e=>{
    const box=canvas.getBoundingClientRect();
    if(!drag){if(e.pointerType==='mouse')hoverAt({x:e.clientX-box.left,y:e.clientY-box.top});return}
    if(drag.id!==e.pointerId)return;
    const dx=e.clientX-drag.x,dy=e.clientY-drag.y;
    if(Math.hypot(e.clientX-drag.startX,e.clientY-drag.startY)>6){hasDragged=true;hint.hidden=true;}
    yaw+=dx*.006;roll-=dx*.0015;pitch=clamp(pitch+dy*.006,-1.4,1.4);drag.x=e.clientX;drag.y=e.clientY;draw();
  });
  canvas.addEventListener('pointerleave',()=>hoverAt(null));
  function end(e){if(drag?.id===e.pointerId){drag=null;canvas.classList.remove('is-dragging');hoverAt(pointer)}}canvas.addEventListener('pointerup',end);canvas.addEventListener('pointercancel',end);
  canvas.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;e.preventDefault();if(introRunning)finishIntro('interrupted');hasDragged=true;hint.hidden=true;targetYaw=targetPitch=hoverYaw=hoverPitch=0;if(e.key==='ArrowLeft')yaw-=.12;if(e.key==='ArrowRight')yaw+=.12;if(e.key==='ArrowUp')pitch=clamp(pitch-.12,-1.4,1.4);if(e.key==='ArrowDown')pitch=clamp(pitch+.12,-1.4,1.4);draw()});
  new ResizeObserver(update).observe(canvas);
  new IntersectionObserver(([entry])=>{inView=entry.isIntersecting;update()}).observe(canvas);
  document.addEventListener('visibilitychange',update);window.addEventListener('site:route',update);reduce.addEventListener('change',update);update();
})();
