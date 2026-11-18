(() => {
  'use strict';
  // Adapted from akaiyol/flower-field 099a90e: website integration without study UI.
  const canvas = document.querySelector('#flower-art'), ctx = canvas.getContext('2d');
  const field = document.querySelector('#flower-field');
  const hint = field.querySelector('.flower-growth-hint');
  let interacted=false, inputMode=matchMedia('(pointer:coarse)').matches?'swipe':'drag';
  let intro='idle', introElapsed=0;
  function updateHint(){hint.firstChild.textContent=`${inputMode} `;hint.hidden=intro!=='complete'||interacted;}
  function dismissHint(){interacted=true;if(intro!=='complete')intro='interrupted';updateHint();}
  addEventListener('wheel',e=>{
    inputMode=e.deltaMode===0&&(e.deltaX!==0||Math.abs(e.deltaY)<50||!Number.isInteger(e.deltaY))?'swipe':'drag';updateHint();
  },{passive:true,capture:true});
  addEventListener('pointerdown',e=>{if(e.pointerType==='touch'){inputMode='swipe';updateHint();}},{passive:true});
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const baseline = Object.freeze({seed:317, petalCount:11, openness:.83, petalCurl:.28, petalLength:1, centerDepth:.38, yaw:0, pitch:0, windStrength:.4, windRate:.12});
  let params = {...baseline}, progress = 0, plants = [], width = 0, height = 0, scale = 1;
  let time = 0, last = null, raf = null, inView = false, dirty = true;
  const ink = '#c5b5ec', TAU = Math.PI * 2;
  const clamp = x => Math.max(0, Math.min(1, x));
  const smooth = x => {x=clamp(x); return x*x*(3-2*x)};
  const rand = (a,b=0) => {let x = Math.imul((a+params.seed*101)|0, 1597334677)^Math.imul(b|0,3812015801);x=Math.imul(x^(x>>>16),2246822507);return ((x^(x>>>13))>>>0)/4294967296};
  const fieldLayout = [
    [0,145,245,.94,-9], [2,205,150,.86,10], [1,304,302,.90,-5],
    [2,417,222,.98,7], [0,490,145,.79,-12], [1,600,278,.95,5],
    [0,714,205,.88,10], [2,838,286,.95,1], [2,920,158,.81,-10],
    [1,1014,265,.83,7], [0,1103,141,.75,-5]
  ];
  let generation=0;
  function build() {
    generation++;bloomAtlas?.close();bloomAtlas=null;
    for(const p of plants)p.sprite?.close?.();
    const mobile=width<=600, indices=mobile?[0,2,7]:fieldLayout.map((_,i)=>i);
    field.classList.toggle('flowers-narrow',mobile);
    plants=indices.map((index,i)=>{
      const [variant,x,h,size,lean]=fieldLayout[index];
      return {id:i, variant, x:mobile?[145,240,315][i]/440:x/1200,
        h:h*(mobile?1.18:1)*Math.cos(lean*Math.PI/180), lean:h*Math.sin(lean*Math.PI/180),
        headScale:size, angle:(rand(index,4)-.5)*.13,
        elevation:(variant===1?12:8)*Math.PI/180, phase:rand(index,6)*TAU, sprite:null, anchor:[0,0], stage:-1, wanted:0};
    });
    if(width>0)bloomWorker?.postMessage({prepare:plants.map(p=>({id:p.id,variant:p.variant,angle:p.angle,elevation:p.elevation})),params});
    dirty=true;
  }
  // One field atlas per update keeps every bloom on the same animation frame.
  // A single in-flight batch prevents stale input from accumulating in the worker.
  let bloomWorker=null,bloomJob=null,bloomAtlas=null;
  function disableBloomWorker(event){event?.preventDefault?.();bloomWorker?.terminate();bloomWorker=null;bloomJob=null;bloomAtlas?.close();bloomAtlas=null;for(const p of plants)p.stage=-1;invalidate();}
  if(typeof Worker==='function'&&typeof OffscreenCanvas==='function'){
    try{
      bloomWorker=new Worker('assets/flower-study/bloom-worker.js?v=3');
      bloomWorker.onerror=disableBloomWorker;
      bloomWorker.onmessage=({data})=>{
        const job=bloomJob;bloomJob=null;
        if(job&&job.generation===generation){
          bloomAtlas?.close();bloomAtlas=data.bitmap;canvas.dataset.bloomRenderer=data.renderer;
          for(const frame of data.frames){const p=plants[frame.id];p.anchor=frame.anchor;p.stage=frame.stage;p.tile=frame.tile;}
          dirty=true;
        }else data.bitmap?.close();
        schedule();dispatchBloom();
      };
    }catch{disableBloomWorker();}
  }
  function dispatchBloom(){
    if(!bloomWorker||bloomJob||!inView||document.hidden||!plants.some(p=>p.wanted>.4&&p.wanted!==p.stage))return;
    bloomJob={generation};
    bloomWorker.postMessage({batch:plants.map(p=>({plant:{id:p.id,variant:p.variant,angle:p.angle,elevation:p.elevation},stage:p.wanted})),params});
  }
  function stem(p,t,g) {
    const sway=reduced.matches?0:params.windStrength*(Math.sin(time*TAU*params.windRate+p.phase)*7+Math.sin(time*.93+p.phase)*1.2);
    return {x:p.lean*t*t+sway*t*t,y:-p.h*g*t};
  }
  function leafTexture(p,j) {
    const sprite=document.createElement('canvas');sprite.width=144;sprite.height=160;
    const c=sprite.getContext('2d');c.scale(2,2);c.translate(4,60);
    const len=27+rand(p.id,j+31)*17, breadth=7+rand(p.id,j+32)*5;
    const lift=3+rand(p.id,j+33)*6, droop=(rand(p.id,j+34)-.35)*12;
    const petiole=4+rand(p.id,j+35)*4;
    const mid=t=>({x:petiole+t*len,y:-petiole*.55-Math.sin(Math.PI*t)*lift-t*len*.38+t*t*t*droop});
    const point=(t,v)=>{
      const center=mid(t);
      // A narrower tip, broad shoulder and asymmetric halves form a leaf blade.
      const half=breadth*Math.sin(Math.PI*t)**.85*(1-.38*t);
      return {x:center.x+v*half*.16,y:center.y+v*half*(v<0?.7:1)};
    };
    const outline=new Path2D();outline.moveTo(petiole,-petiole*.55);
    for(let k=1;k<=32;k++){const q=point(k/32,-1);outline.lineTo(q.x,q.y)}
    for(let k=31;k>=0;k--){const q=point(k/32,1);outline.lineTo(q.x,q.y)}outline.closePath();
    c.fillStyle='#000';c.fill(outline);
    c.fillStyle=ink;
    for(let k=0;k<2500;k++){
      const t=rand(p.id*1301+j*733+k,61),v=rand(p.id*1301+j*733+k,62)*2-1;
      // Thin the shaded half and center crease; retain a luminous curved edge.
      if(rand(k,p.id*31+j+65)>(v<0?.65:.95))continue;
      const q=point(t,v);c.globalAlpha=.65+Math.abs(v)*.35;c.fillRect(q.x,q.y,.6,.6);
    }
    c.globalAlpha=.75;c.strokeStyle=ink;c.lineWidth=.45;
    c.beginPath();c.moveTo(0,0);c.lineTo(petiole,-petiole*.55);
    for(let k=1;k<=28;k++){const q=mid(k/28);c.lineTo(q.x,q.y)}c.stroke();
    // Short branching veins follow the blade instead of floating over it.
    c.globalAlpha=.38;c.setLineDash([.45,1.1]);
    for(let k=2;k<=6;k++)for(const sign of [-1,1]){
      const t=k/8,a=mid(t),b=point(Math.min(.97,t+.13),sign*.83);
      c.beginPath();c.moveTo(a.x,a.y);c.quadraticCurveTo(a.x+len*.07,a.y+(b.y-a.y)*.2,b.x,b.y);c.stroke();
    }
    return sprite;
  }
  function leaf(p,j,g,stemGrowth) {
    const amount=smooth((g-(j===0?.18:.34))/.3);if(!amount)return;
    const at=j===0?.29:.57,pos=stem(p,at,stemGrowth),side=(p.id+j)%2?1:-1;
    p.leaves??=[];const sprite=p.leaves[j]??(p.leaves[j]=leafTexture(p,j));
    ctx.save();ctx.translate(pos.x,pos.y);ctx.scale(side*amount,amount);
    ctx.drawImage(sprite,-4,-60,72,80);ctx.restore();
  }
  function draw() {
    const dpr=Math.min(devicePixelRatio||1,2);ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,width,height);
    const world=width<=600?440:1200;scale=width/world;
    // Preserve useful bloom size on desktop; narrow fields use three taller complete plants.
    const unit=width<=600?scale:Math.min(scale,1.2), bottom=height;
    let visible=0;const stages=[],rulers=[];
    for(const p of plants){
      const local=clamp((progress*1.6-p.id/(plants.length-1)*.65)/.95),stage=Math.round(local*1000)/1000;
      p.wanted=stage;const stemGrowth=smooth(local/.65);stages.push(stage);if(local<=0)continue;visible++;
      ctx.save();ctx.translate(p.x*width,bottom);ctx.scale(unit,unit);
      ctx.strokeStyle=ink;ctx.lineWidth=.8;ctx.setLineDash([.5,2]);ctx.beginPath();ctx.moveTo(0,0);
      for(let j=1;j<=40;j++){const s=stem(p,j/40,stemGrowth);ctx.lineTo(s.x,s.y)}ctx.stroke();ctx.setLineDash([]);
      leaf(p,0,local,stemGrowth);leaf(p,1,local,stemGrowth);
      // One shared scale: 1.00 represents 300 design units, not each plant's height.
      const labelSize=width<=600?Math.max(9,9/unit):9, length=p.h*stemGrowth;
      const label=value=>value.toFixed(2).replace(/^0/, '');
      ctx.font=`${labelSize}px Menlo,monospace`;ctx.fillStyle=ink;
      const writeLabel=(text,x,y)=>{
        ctx.save();ctx.strokeStyle='#000';ctx.lineWidth=1.5/unit;ctx.lineJoin='round';ctx.strokeText(text,x,y);ctx.fillText(text,x,y);ctx.restore();
      };
      for(let distance=15;distance<length;distance+=15){
        const pt=stem(p,distance/length,stemGrowth),major=distance%30===0;
        ctx.globalAlpha=smooth((length-distance)/15);ctx.beginPath();ctx.moveTo(pt.x+1,pt.y);ctx.lineTo(pt.x+(major?5:3),pt.y);ctx.lineWidth=.5;ctx.stroke();
        if(major&&length-distance>labelSize*1.6)writeLabel(label(distance/300),pt.x+8,pt.y+3);
      }
      if(length>labelSize*2){
        const tip=stem(p,1,stemGrowth);ctx.globalAlpha=1;ctx.beginPath();ctx.moveTo(tip.x+1,tip.y);ctx.lineTo(tip.x+5,tip.y);ctx.stroke();
        writeLabel(label(length/300),tip.x+8,tip.y+3);
        rulers.push({id:p.id,length:+length.toFixed(3),value:+(length/300).toFixed(2),tip:{x:+tip.x.toFixed(3),y:+tip.y.toFixed(3)}});
      }ctx.globalAlpha=1;
      if(!bloomWorker&&(stage!==p.stage||!p.sprite)){p.sprite=FlowerBloom.render(p,stage,params);p.anchor=p.sprite.anchor;p.stage=stage}
      if(stage<=.4||(!p.sprite&&!bloomAtlas)){ctx.restore();continue;}
      const top=stem(p,1,stemGrowth);ctx.translate(top.x,top.y);
      const flutter=reduced.matches?0:params.windStrength*.018*Math.sin(time*1.4+p.phase);
      ctx.rotate(flutter);ctx.scale(p.headScale,p.headScale);ctx.translate(-p.anchor[0],-p.anchor[1]);if(bloomWorker&&bloomAtlas&&p.tile)ctx.drawImage(bloomAtlas,...p.tile,-120,-110,240,200);else if(p.sprite)ctx.drawImage(p.sprite,-130,-175,260,300);ctx.restore();
    }
    // Read-only observations for verification; input still uses the production UI.
    canvas.dataset.progress=progress.toFixed(6);canvas.dataset.plants=visible;canvas.dataset.stages=JSON.stringify(stages);canvas.dataset.seed=params.seed;
    canvas.dataset.intro=intro;canvas.dataset.rulers=JSON.stringify(rulers);
    canvas.dataset.time=time.toFixed(4);canvas.dataset.frame=String(Number(canvas.dataset.frame||0)+1);
    canvas.dataset.bloomPending=String(plants.some(p=>p.wanted>.4&&p.stage!==p.wanted));
    dirty=false;dispatchBloom();
  }
  function frame(now){
    raf=null;const delta=last===null?0:now-last;time+=delta/1000;last=now;
    if(intro==='running'){
      introElapsed+=delta;progress=smooth(introElapsed/3800);dirty=true;
      if(introElapsed>=3800){progress=1;intro='complete';updateHint();}
    }
    if(dirty||!reduced.matches&&params.windStrength>0)draw();schedule();
  }
  function schedule(){if(raf===null&&inView&&!document.hidden&&(dirty||intro==='running'||!reduced.matches&&params.windStrength>0))raf=requestAnimationFrame(frame);else if(raf===null)last=null}
  function invalidate(){dirty=true;schedule()}
  function visibility(){if(raf!==null)cancelAnimationFrame(raf);raf=null;last=null;schedule()}
  function setGrowth(value){progress=clamp(value);invalidate()}
  field.addEventListener('wheel',e=>{const delta=e.deltaX||e.deltaY;if(!delta)return;dismissHint();e.preventDefault();const factor=e.deltaMode===1?16:e.deltaMode===2?width:1;setGrowth(progress+delta*factor/1400)},{passive:false});
  let drag=null;
  field.addEventListener('pointerdown',e=>{if(e.button!==0)return;drag={id:e.pointerId,x:e.clientX,y:e.clientY,progress};field.setPointerCapture(e.pointerId)});
  field.addEventListener('pointermove',e=>{if(!drag||e.pointerId!==drag.id||Math.abs(e.clientX-drag.x)<6)return;dismissHint();setGrowth(drag.progress+(e.clientX-drag.x)/Math.max(width*.8,240))});
  const end=e=>{if(drag?.id===e.pointerId)drag=null};field.addEventListener('pointerup',end);field.addEventListener('pointercancel',end);
  field.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(e.key))return;e.preventDefault();dismissHint();setGrowth(e.key==='Home'?0:e.key==='End'?1:progress+(['ArrowRight','ArrowDown'].includes(e.key)?.04:-.04))});
  new ResizeObserver(()=>{width=field.clientWidth;height=field.clientHeight;const dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);build();invalidate()}).observe(field);
  new IntersectionObserver(([entry])=>{
    inView=entry.isIntersecting;
    if(entry.intersectionRatio>=.12&&intro==='idle'){
      intro=reduced.matches?'complete':'running';if(reduced.matches)progress=1;updateHint();dirty=true;
    }
    visibility();
  },{threshold:[0,.12],rootMargin:'0px 0px -100px 0px'}).observe(field);
  reduced.addEventListener('change',()=>{if(reduced.matches&&intro==='running'){intro='complete';progress=1;updateHint();}invalidate();visibility()});document.addEventListener('visibilitychange',visibility);
})();
