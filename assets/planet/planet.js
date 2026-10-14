(() => {
  'use strict';
  const canvas=document.querySelector('#home-planet'), hero=document.querySelector('.hero');
  const ctx=canvas.getContext('2d'), surface=document.createElement('canvas'), paint=surface.getContext('2d',{willReadFrequently:true});
  const reduce=matchMedia('(prefers-reduced-motion: reduce)'),TAU=Math.PI*2;
  let width=0,height=0,phase=0,pitch=.40,roll=.32,yaw=0,raf=null,last=null,lastPaint=0,drag=null,inView=true;
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  function project(x,y,z){
    const X=x*Math.cos(yaw)-z*Math.sin(yaw),Z=x*Math.sin(yaw)+z*Math.cos(yaw);
    const Y=y*Math.cos(pitch)-Z*Math.sin(pitch),depth=y*Math.sin(pitch)+Z*Math.cos(pitch);
    return [X*Math.cos(roll)-Y*Math.sin(roll),-(X*Math.sin(roll)+Y*Math.cos(roll)),depth];
  }
  function draw(){
    if(!width||!height)return;
    const radius=width>700?Math.max(width*.34,height*.58):width*.78;
    const cx=width-radius*.16,cy=height*.55;
    paint.clearRect(0,0,width,height);paint.strokeStyle='#c5b5ec';paint.lineWidth=1.65;
    function curve(points){paint.beginPath();let started=false;for(const q of points){if(!q){started=false;continue}const x=cx+q[0]*radius,y=cy+q[1]*radius;started?paint.lineTo(x,y):paint.moveTo(x,y);started=true}paint.stroke()}
    function rings(front){
      for(let band=0;band<34;band++){
        const base=1.22+band*.022+(band>14?.075:0)+(band>25?.035:0),points=[];
        for(let k=0;k<=540;k++){
          const a=k/540*TAU,turn=a-phase;
          const r=base+.009*Math.sin(turn*3+band*.31)+.004*Math.sin(turn*7);
          const q=project(r*Math.cos(a),0,r*Math.sin(a));
          // Rotating seams and unequal strand widths make axial spin visible.
          const seam=Math.sin(turn*2+band*.065)>.988;
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
    canvas.dataset.phase=phase.toFixed(5);canvas.dataset.rotation=[yaw,pitch,roll].map(v=>v.toFixed(4)).join(',');
    canvas.dataset.frame=String(Number(canvas.dataset.frame||0)+1);
  }
  function active(){return !hero.hidden&&!document.hidden&&inView}
  function frame(now){raf=null;if(!active()){last=null;return}if(last!==null&&!reduce.matches)phase=(phase+(now-last)/1000*TAU/64)%TAU;last=now;if(now-lastPaint>50){draw();lastPaint=now}if(!reduce.matches)raf=requestAnimationFrame(frame)}
  function update(){if(raf!==null)cancelAnimationFrame(raf);raf=null;last=null;if(active()){resize();draw();if(!reduce.matches)raf=requestAnimationFrame(frame)}}
  function resize(){if(hero.hidden)return;width=Math.round(canvas.clientWidth);height=Math.round(canvas.clientHeight);const dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);surface.width=width;surface.height=height}
  canvas.addEventListener('pointerdown',e=>{if(e.button!==0)return;drag={id:e.pointerId,x:e.clientX,y:e.clientY};canvas.setPointerCapture(e.pointerId);canvas.classList.add('is-dragging')});
  canvas.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;yaw+=dx*.006;roll-=dx*.0015;pitch=clamp(pitch+dy*.006,-1.4,1.4);drag.x=e.clientX;drag.y=e.clientY;draw()});
  function end(e){if(drag?.id===e.pointerId){drag=null;canvas.classList.remove('is-dragging')}}canvas.addEventListener('pointerup',end);canvas.addEventListener('pointercancel',end);
  canvas.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;e.preventDefault();if(e.key==='ArrowLeft')yaw-=.12;if(e.key==='ArrowRight')yaw+=.12;if(e.key==='ArrowUp')pitch=clamp(pitch-.12,-1.4,1.4);if(e.key==='ArrowDown')pitch=clamp(pitch+.12,-1.4,1.4);draw()});
  new ResizeObserver(update).observe(canvas);
  new IntersectionObserver(([entry])=>{inView=entry.isIntersecting;update()}).observe(canvas);
  document.addEventListener('visibilitychange',update);window.addEventListener('site:route',update);reduce.addEventListener('change',update);update();
})();
