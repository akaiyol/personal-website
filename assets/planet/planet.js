import * as ball from './trackball.js';
import { createPlanetSurface } from './planet-surface.js?v=2';
(() => {
  'use strict';
  let canvas=document.querySelector('#home-planet');const hero=document.querySelector('.hero');
  let ctx=null,contextAvailable=true;const surface=document.createElement('canvas'), paint=surface.getContext('2d',{willReadFrequently:true});
  const reduce=matchMedia('(prefers-reduced-motion: reduce)'),TAU=Math.PI*2;
  const startPose=Object.freeze({pitch:-1.40,roll:.32}),restPose=Object.freeze({pitch:.40,roll:.32});
  let width=0,height=0,phase=0,pitch=reduce.matches?restPose.pitch:startPose.pitch,roll=restPose.roll,yaw=0,raf=null,last=null,lastPaint=0,drag=null,inView=true;
  const idleSpeed=TAU/64,friction=2.0;
  let angularVelocity=[0,0,0],orientation=ball.identity(),skyOrientation=ball.identity(),skyPhase=0;
  let introElapsed=0, introRunning=!reduce.matches, introState=reduce.matches?'complete':'running';
  function finishIntro(reason='complete') {introRunning=false;introState=reason;if(reason==='complete'){roll=restPose.roll;pitch=restPose.pitch;}hoverAt(pointer);}
  const hint=document.createElement('span');hint.id='planet-drag-hint';hint.textContent='[ drag ↔ ]';hint.hidden=true;hint.setAttribute('aria-hidden','true');canvas.after(hint);
  let pointer=null,hoverYaw=0,hoverPitch=0,targetYaw=0,targetPitch=0,hasDragged=false;
  function hoverAt(point){
    pointer=point;
    if(!point||introRunning||drag||hero.hidden){targetYaw=targetPitch=0;hint.hidden=true;return}
    const r=width>700?Math.max(width*.34,height*.58):width*.78,cx=width-r*.16,cy=height*.55;
    const dx=(point.x-cx)/r,dy=(point.y-cy)/r;
    const normal=project(0,1,0),depth=Math.abs(normal[2])>.06?-(normal[0]*dx+normal[1]*dy)/normal[2]:Infinity;
    const ring=Math.hypot(dx,dy,depth);
    const hit=dx*dx+dy*dy<=1||(ring>=1.15&&ring<=2.12);
    targetYaw=hit&&!reduce.matches?.025+clamp(dx*.016,-.016,.016):0;
    targetPitch=hit&&!reduce.matches?-.017+clamp(dy*.016,-.016,.016):0;
    hint.hidden=!hit||hasDragged;
    hint.style.left=Math.min(width-106,Math.max(8,point.x+16))+'px';
    hint.style.top=Math.min(height-30,Math.max(8,point.y+18))+'px';
  }
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  function project(x,y,z,view=orientation,hover=true){
    const viewYaw=yaw+(hover?hoverYaw:0),viewPitch=pitch+(hover?hoverPitch:0);
    const X=x*Math.cos(viewYaw)-z*Math.sin(viewYaw),Z=x*Math.sin(viewYaw)+z*Math.cos(viewYaw);
    const Y=y*Math.cos(viewPitch)-Z*Math.sin(viewPitch),depth=y*Math.sin(viewPitch)+Z*Math.cos(viewPitch);
    const q=ball.rotate(view,[X*Math.cos(roll)-Y*Math.sin(roll),X*Math.sin(roll)+Y*Math.cos(roll),depth]);
    return [q[0],-q[1],q[2]];
  }
  function rotationAngles(){
    const x=project(1,0,0,orientation,false),y=project(0,1,0,orientation,false),z=project(0,0,1,orientation,false);
    return [Math.atan2(x[2],z[2]),Math.asin(clamp(y[2],-1,1)),Math.atan2(-y[0],-y[1])];
  }
  function observations(){
    canvas.dataset.phase=phase.toFixed(5);canvas.dataset.rotation=rotationAngles().map(v=>v.toFixed(4)).join(',');
    canvas.dataset.orientation=orientation.map(v=>v.toFixed(8)).join(',');
    canvas.dataset.angularVelocity=angularVelocity.map(v=>v.toFixed(6)).join(',');
    canvas.dataset.intro=introState;canvas.dataset.hover=[hoverYaw,hoverPitch].map(v=>v.toFixed(5)).join(',');
    canvas.dataset.spin=Math.hypot(...angularVelocity).toFixed(4);canvas.dataset.skyPhase=skyPhase.toFixed(5);
    canvas.dataset.frame=String(Number(canvas.dataset.frame||0)+1);
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
    const visible=[],focal=Math.max(width,height)*.65,turn=Math.cos(skyPhase),spin=Math.sin(skyPhase);
    for(const star of stars){
      const q=project(star.x*turn-star.z*spin,star.y,star.x*spin+star.z*turn,skyOrientation);
      if(q[2]<=.12)continue;
      const x=width*.5+q[0]/q[2]*focal,y=height*.5+q[1]/q[2]*focal;
      if(x<2||x>width-2||y<2||y>height-2||Math.hypot(x-cx,y-cy)<radius+3)continue;
      if(ctx){ctx.beginPath();ctx.arc(x,y,star.size,0,TAU);ctx.fill();}
      visible.push({id:star.id,x:+x.toFixed(3),y:+y.toFixed(3),size:star.size});
    }
    canvas.dataset.stars=JSON.stringify(visible);return visible;
  }
  let renderer=createPlanetSurface(canvas,()=>{if(active())draw();});
  if(!renderer){ctx=canvas.getContext('2d');if(!ctx){const replacement=canvas.cloneNode();canvas.replaceWith(replacement);canvas=replacement;ctx=canvas.getContext('2d');}}
  canvas.addEventListener('webglcontextlost',()=>{contextAvailable=false;update();});
  canvas.addEventListener('webglcontextrestored',()=>{renderer=createPlanetSurface(canvas,()=>{if(active())draw();});contextAvailable=true;update();});
  function draw(){
    if(!width||!height)return;
    const radius=width>700?Math.max(width*.34,height*.58):width*.78;
    const cx=width-radius*.16,cy=height*.55,dpr=Math.min(devicePixelRatio||1,2);
    const image=renderer?.draw({width,height,dpr,radius,cx,cy,phase,stars:drawStars(cx,cy,radius),bx:project(1,0,0),by:project(0,1,0),bz:project(0,0,1)});
    if(!image){if(!renderer){drawLegacy();canvas.dataset.renderer='legacy';}return;}
    canvas.dataset.renderer='accelerated';
    observations();
  }
  function drawLegacy(){
    if(!width||!height)return;
    const radius=width>700?Math.max(width*.34,height*.58):width*.78;
    const cx=width-radius*.16,cy=height*.55;
    paint.clearRect(0,0,width,height);paint.strokeStyle='#c5b5ec';paint.lineWidth=1.65;
    function curve(points){paint.beginPath();let started=false;for(const q of points){if(!q){started=false;continue}const x=cx+q[0]*radius,y=cy+q[1]*radius;started?paint.lineTo(x,y):paint.moveTo(x,y);started=true}paint.stroke()}
    function rings(front){
      paint.lineWidth=1.4;
      for(let band=0;band<34;band++){
        const base=1.22+band*.022+(band>14?.075:0)+(band>25?.035:0),points=[];
        for(let k=0;k<=540;k++){
          const a=k/540*TAU,turn=a-phase;
          const r=base; // Concentric circles project to clean ellipses; spin changes texture only.
          const q=project(r*Math.cos(a),0,r*Math.sin(a));
          // Rotating seams and unequal strand widths make axial spin visible.
          const seam=Math.sin(turn*2+band*.065)>.997;
          points.push((q[2]>=0)===front&&!seam?q:null);
        }curve(points);
      }
    }
    rings(false);
    paint.fillStyle='#000';paint.beginPath();paint.arc(cx,cy,radius,0,TAU);paint.fill();
    // Reflected ring bands follow the spherical surface and the ring phase.
    for(let band=0;band<29;band++){
      const points=[];
      for(let k=0;k<=540;k++){
        const a=k/540*TAU,turn=a-phase;
        const latitude=.24+band*.019+.075*Math.sin(turn*3+band*.08);
        const q=project(Math.cos(latitude)*Math.cos(a),Math.sin(latitude),Math.cos(latitude)*Math.sin(a));
        points.push(q[2]>0&&Math.sin(turn*2+band*.065)<.988?q:null);
      }curve(points);
    }
    // Fine spherical rim, leaving the lower hemisphere mostly negative space.
    paint.lineWidth=1;paint.beginPath();paint.arc(cx,cy,radius,0,TAU);paint.stroke();
    rings(true);
    const pixels=paint.getImageData(0,0,width,height).data;
    const dpr=Math.min(devicePixelRatio||1,2);ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,width,height);ctx.fillStyle='#c5b5ec';
    drawStars(cx,cy,radius);
    // A regular 2×4 dot-cell lattice echoes Braille without a shaded bitmap.
    const step=width<=600?3:3.2;
    ctx.beginPath();
    for(let row=0,y=1;y<height-1;row++,y+=step+(row%4===3?.9:0)){
      for(let col=0,x=1;x<width-1;col++,x+=step+(col%2===1?.75:0)){
        const ix=Math.round(x),iy=Math.round(y),i=(iy*width+ix)*4;
        if(Math.max(pixels[i],pixels[i-4],pixels[i+4],pixels[i-width*4],pixels[i+width*4])<70)continue;
        ctx.moveTo(x+1,y);ctx.arc(x,y,width<=600?.82:.95,0,TAU);
      }
    }ctx.fill();
    observations();
  }
  function stopSpin(){angularVelocity=[0,0,0];}
  function bakeHover(){yaw+=hoverYaw;pitch+=hoverPitch;hoverYaw=hoverPitch=targetYaw=targetPitch=0;}
  function trackPoint(clientX,clientY){
    const box=canvas.getBoundingClientRect(),radius=width>700?Math.max(width*.34,height*.58):width*.78;
    return ball.point(clientX-box.left,clientY-box.top,width-radius*.16,height*.55,radius);
  }
  function active(){return contextAvailable&&!hero.hidden&&!document.hidden&&inView}
  function frame(now){
    raf=null;if(!active()){last=null;return}
    if(last!==null&&!reduce.matches){
      const dt=now-last;const easeHover=1-Math.exp(-dt/140);hoverYaw+=(targetYaw-hoverYaw)*easeHover;hoverPitch+=(targetPitch-hoverPitch)*easeHover;const seconds=Math.min(dt/1000,.05),decay=Math.exp(-seconds/friction);
      skyPhase=(skyPhase+seconds*idleSpeed)%TAU;
      const speed=Math.hypot(...angularVelocity);
      if(!drag&&speed>0){
        // Continue the same screen-space angular rotation used by the drag.
        orientation=ball.multiply(ball.axisAngle(angularVelocity,speed*friction*(1-decay)),orientation);
        angularVelocity=angularVelocity.map(v=>v*decay);
        if(Math.hypot(...angularVelocity)<.005)stopSpin();
      }
      phase=(phase+seconds*idleSpeed)%TAU;
      if(introRunning){
        introElapsed+=dt;
        const t=clamp((introElapsed-180)/(3000/1.3),0,1),ease=t*t*t*(t*(t*6-15)+10);
        roll=startPose.roll+(restPose.roll-startPose.roll)*ease;pitch=startPose.pitch+(restPose.pitch-startPose.pitch)*ease;
        if(t===1)finishIntro();
      }
    }
    last=now;if(canvas.dataset.renderer==='accelerated'||now-lastPaint>50){draw();lastPaint=now}
    if(!reduce.matches)raf=requestAnimationFrame(frame);
  }
  function update(){
    if(raf!==null)cancelAnimationFrame(raf);raf=null;last=null;
    if(introRunning&&(reduce.matches||hero.hidden))finishIntro();
    if(hero.hidden){hoverAt(null);hoverYaw=hoverPitch=0;}
    if(reduce.matches){stopSpin();hoverYaw=hoverPitch=0;hoverAt(pointer);}
    if(!active())stopSpin();
    if(active()){resize();hoverAt(pointer);draw();if(!reduce.matches)raf=requestAnimationFrame(frame)}
  }
  function resize(){if(hero.hidden)return;width=Math.round(canvas.clientWidth);height=Math.round(canvas.clientHeight);const dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);surface.width=width;surface.height=height}
  canvas.addEventListener('pointerdown',e=>{
    if(e.button!==0||drag)return;
    if(introRunning)finishIntro('interrupted');stopSpin();bakeHover();
    drag={id:e.pointerId,startX:e.clientX,startY:e.clientY,startPoint:trackPoint(e.clientX,e.clientY),startOrientation:orientation.slice(),startSky:skyOrientation.slice(),samples:[{x:e.clientX,y:e.clientY,t:e.timeStamp,q:orientation.slice()}]};
    canvas.setPointerCapture(e.pointerId);canvas.classList.add('is-dragging');
  });
  canvas.addEventListener('pointermove',e=>{
    const box=canvas.getBoundingClientRect();
    if(!drag){if(e.pointerType==='mouse')hoverAt({x:e.clientX-box.left,y:e.clientY-box.top});return;}
    if(drag.id!==e.pointerId)return;
    if(Math.hypot(e.clientX-drag.startX,e.clientY-drag.startY)>6){hasDragged=true;hint.hidden=true;}
    const delta=ball.between(drag.startPoint,trackPoint(e.clientX,e.clientY));
    orientation=ball.multiply(delta,drag.startOrientation);skyOrientation=ball.multiply(delta,drag.startSky);
    drag.samples.push({x:e.clientX,y:e.clientY,t:e.timeStamp,q:orientation.slice()});
    drag.samples=drag.samples.filter(sample=>e.timeStamp-sample.t<=90).slice(-12);
    if(reduce.matches)draw();
  });
  canvas.addEventListener('pointerleave',()=>hoverAt(null));
  function end(e){
    if(drag?.id!==e.pointerId)return;
    const samples=drag.samples,first=samples[0],lastSample=samples[samples.length-1];
    if(e.type==='pointerup'&&!reduce.matches&&e.timeStamp-lastSample.t<80&&samples.length>1&&Math.hypot(lastSample.x-first.x,lastSample.y-first.y)>12){
      const velocity=ball.velocity(first.q,lastSample.q,(lastSample.t-first.t)/1000);
      if(Math.hypot(...velocity)>.7)angularVelocity=velocity;
    }
    drag=null;canvas.classList.remove('is-dragging');hoverAt(pointer);
  }
  canvas.addEventListener('pointerup',end);canvas.addEventListener('pointercancel',end);canvas.addEventListener('lostpointercapture',end);
  canvas.addEventListener('keydown',e=>{
    const axes={ArrowLeft:[0,-1,0],ArrowRight:[0,1,0],ArrowUp:[-1,0,0],ArrowDown:[1,0,0]};
    const axis=axes[e.key];if(!axis)return;e.preventDefault();stopSpin();
    if(introRunning)finishIntro('interrupted');bakeHover();hasDragged=true;hint.hidden=true;
    const delta=ball.axisAngle(axis,.12);orientation=ball.multiply(delta,orientation);skyOrientation=ball.multiply(delta,skyOrientation);
    if(e.shiftKey&&!reduce.matches)angularVelocity=axis.map(v=>v*5);draw();
  });
  new ResizeObserver(update).observe(canvas);
  new IntersectionObserver(([entry])=>{inView=entry.isIntersecting;update()}).observe(canvas);
  document.addEventListener('visibilitychange',update);window.addEventListener('site:route',update);reduce.addEventListener('change',update);update();
})();
