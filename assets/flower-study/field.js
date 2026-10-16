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
  function build() {
    const mobile=width<=600, indices=mobile?[0,2,3,5,8,9]:fieldLayout.map((_,i)=>i);
    plants=indices.map((index,i)=>{
      const [variant,x,h,size,lean]=fieldLayout[index];
      return {id:i, variant, x:mobile?[150,260,365,455,560,620][i]/760:x/1200,
        h:h*Math.cos(lean*Math.PI/180), lean:h*Math.sin(lean*Math.PI/180),
        headScale:size, angle:(rand(index,4)-.5)*.13,
        elevation:(variant===1?12:8)*Math.PI/180, phase:rand(index,6)*TAU, sprite:null, stage:-1};
    });
    dirty=true;
  }
  // Authored ribbon centerlines establish the reference silhouette. Every petal
  // remains a generated curved surface rooted on the same numeric cup.
  const petalProfiles = [
    {a:[-17,0,-10],b:[-28,17,-15],c:[-49,33,-18],d:[-57,34,-16],w:3.5},
    {a:[-12,0,-17],b:[-16,22,-22],c:[-34,46,-25],d:[-29,46,-22],w:5.5},
    {a:[-5,0,-22],b:[-10,25,-26],c:[-10,51,-25],d:[-3,49,-22],w:7},
    {a:[4,0,-22],b:[8,23,-25],c:[23,48,-24],d:[27,45,-20],w:6},
    {a:[13,0,-17],b:[23,20,-21],c:[48,38,-20],d:[51,33,-16],w:3.2},
    {a:[20,0,-8],b:[36,14,-10],c:[65,23,-10],d:[74,18,-5],w:4.2},
    {a:[-22,0,-3],b:[-41,12,-2],c:[-71,11,2],d:[-83,-9,6],w:6.3},
    {a:[22,0,-2],b:[43,13,2],c:[71,9,7],d:[83,-11,10],w:7.1},
    {a:[-17,0,15],b:[-32,6,20],c:[-57,1,24],d:[-65,-14,25],w:7},
    {a:[-6,0,22],b:[-18,7,30],c:[-28,9,42],d:[-34,2,48],w:11},
    {a:[13,0,19],b:[26,10,26],c:[47,11,35],d:[56,0,39],w:7.5}
  ];
  function bloom(p,g) {
    const sprite=document.createElement('canvas');sprite.width=520;sprite.height=600;sprite.anchor=[0,0];
    const c=sprite.getContext('2d');c.translate(260,350);c.scale(2,2);
    const yaw=params.yaw*Math.PI/180+p.angle, elevation=p.elevation+params.pitch*Math.PI/180;
    const tilt=p.variant===1?-.25:p.variant===2?.10:-.06;
    const project=([x,y,z])=>{
      const X=x*Math.cos(yaw)-z*Math.sin(yaw),Z=x*Math.sin(yaw)+z*Math.cos(yaw);
      const Y=-y*Math.cos(elevation)+Z*Math.sin(elevation);
      return [X*Math.cos(tilt)-Y*Math.sin(tilt),X*Math.sin(tilt)+Y*Math.cos(tilt),Z*Math.cos(elevation)+y*Math.sin(elevation)];
    };
    const open=smooth((g-.53)/.47), bowl=smooth((g-.4)/.32), radius=24*bowl, depth=params.centerDepth*122*bowl*(p.variant===2?.8:1);
    if(!bowl)return sprite;
    sprite.anchor=project([0,-depth,0]);
    const cubic=(profile,t)=>profile.a.map((a,k)=>(1-t)**3*a+3*(1-t)**2*t*profile.b[k]+3*(1-t)*t*t*profile.c[k]+t**3*profile.d[k]);
    const petals=[];
    for(let j=0;j<params.petalCount;j++){
      const profile=petalProfiles[j%petalProfiles.length];
      const extra=j>=petalProfiles.length?(j-petalProfiles.length+1)*.15:0;
      const variation=.94+rand(p.id*43+j,12)*.12;
      const center=t=>{
        const q=cubic(profile,t),reach=params.petalLength*variation;
        let x=profile.a[0]+(q[0]-profile.a[0])*reach;
        let y=q[1]*reach*(p.variant===2?.48:p.variant===0?.62:1.12),z=q[2];
        const opening=open*params.openness/.83;
        x=profile.a[0]*(1-t*.7)+(x-profile.a[0]*(1-t*.7))*opening;
        y=(1-opening)*t*55*reach+opening*y;
        y+=params.petalCurl*9*Math.sin(Math.PI*t)-params.petalCurl*8*t*t;
        if(p.variant===1)x-=y*.12;
        z=z*bowl+extra*x;
        return [x*bowl,y*bowl,z];
      };
      const point=(t,v)=>{
        const q=center(t),before=center(Math.max(0,t-.002)),after=center(Math.min(1,t+.002));
        const dx=after[0]-before[0],dy=after[1]-before[1],len=Math.hypot(dx,dy)||1;
        const w=profile.w*Math.sin(Math.PI*t)**.65*(.15+.85*open)*v;
        return [q[0]-dy/len*w,q[1]+dx/len*w+Math.abs(v)**1.8*Math.sin(Math.PI*t)*profile.w*.16,q[2]+w*.18];
      };
      const boundary=[];for(let k=0;k<=44;k++)boundary.push(project(point(k/44,-1)));
      for(let k=44;k>=0;k--)boundary.push(project(point(k/44,1)));
      petals.push({j,point,boundary,z:project(center(.5))[2]});
    }
    const paintPetal=petal=>{
      const path=new Path2D();petal.boundary.forEach((q,i)=>i?path.lineTo(q[0],q[1]):path.moveTo(q[0],q[1]));path.closePath();
      c.fillStyle='#000';c.fill(path);c.save();c.clip(path);c.fillStyle=ink;
      // Sample along the ribbon without painting individual opaque mesh tiles.
      // Its continuous silhouette is more important than random fold noise.
      const samples=2300;
      for(let k=0;k<samples;k++){
        const seed=p.id*700001+petal.j*5003+k;
        const t=rand(seed,41),v=rand(seed,42)*2-1;
        if(rand(seed,43)>(v<0?.82:.98))continue;
        const q=project(petal.point(t,v));c.globalAlpha=.78+rand(seed,44)*.22;
        c.fillRect(q[0],q[1],.48+rand(seed,45)*.22,.58);
      }
      c.restore();c.globalAlpha=1;
    };
    petals.sort((a,b)=>a.z-b.z);
    petals.filter(q=>q.z<9).forEach(paintPetal);
    const cupPoint=(u,a)=>{const r=radius*(.08+.92*u**.85);return project([r*Math.cos(a),-depth*(1-u),r*Math.sin(a)])};
    const cup=new Path2D();
    for(let k=0;k<=30;k++){const q=cupPoint(1,k*TAU/30);k?cup.lineTo(q[0],q[1]):cup.moveTo(q[0],q[1])}
    for(let k=30;k>=0;k--){const q=cupPoint(0,k*TAU/30);cup.lineTo(q[0],q[1])}cup.closePath();c.fillStyle='#000';c.fill(cup);
    // Individual glyphs follow the visible half of the bowl; each row encodes u.
    c.fillStyle=ink;c.textAlign='center';c.textBaseline='middle';
    for(let row=0;row<7;row++){
      const u=.12+row*.13, count=Math.max(3,Math.round(14*(.1+.9*u)));
      const digits=(u.toFixed(2).slice(1)).repeat(4).slice(0,count);
      for(let k=0;k<digits.length;k++){
        const a=.12+(Math.PI-.24)*k/(digits.length-1),q=cupPoint(u,a);
        c.save();c.translate(q[0],q[1]);c.scale(.45+.55*Math.sin(a),1);c.font=`${5.5+u*2.5}px Menlo,monospace`;c.fillText(digits[k],0,0);c.restore();
      }
    }
    petals.filter(q=>q.z>=9).forEach(paintPetal);
    return sprite;
  }
  function stem(p,t,g) {
    const sway=reduced.matches?0:params.windStrength*(Math.sin(time*TAU*params.windRate+p.phase)*7+Math.sin(time*.93+p.phase)*1.2);
    return {x:p.lean*t*t+sway*t*t,y:-p.h*g*t};
  }
  function leaf(p,j,g,stemGrowth) {
    const amount=smooth((g-(j===0?.18:.34))/.3);if(!amount)return;
    const at=j===0?.29:.57, pos=stem(p,at,stemGrowth),side=(p.id+j)%2?1:-1;
    ctx.save();ctx.translate(pos.x,pos.y);ctx.scale(side*amount,amount);
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
    ctx.fillStyle='#000';ctx.fill(outline);
    ctx.fillStyle=ink;
    for(let k=0;k<2500;k++){
      const t=rand(p.id*1301+j*733+k,61),v=rand(p.id*1301+j*733+k,62)*2-1;
      // Thin the shaded half and center crease; retain a luminous curved edge.
      if(rand(k,p.id*31+j+65)>(v<0?.65:.95))continue;
      const q=point(t,v);ctx.globalAlpha=.65+Math.abs(v)*.35;ctx.fillRect(q.x,q.y,.6,.6);
    }
    ctx.globalAlpha=.75;ctx.strokeStyle=ink;ctx.lineWidth=.45;
    ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(petiole,-petiole*.55);
    for(let k=1;k<=28;k++){const q=mid(k/28);ctx.lineTo(q.x,q.y)}ctx.stroke();
    // Short branching veins follow the blade instead of floating over it.
    ctx.globalAlpha=.38;ctx.setLineDash([.45,1.1]);
    for(let k=2;k<=6;k++)for(const sign of [-1,1]){
      const t=k/8,a=mid(t),b=point(Math.min(.97,t+.13),sign*.83);
      ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.quadraticCurveTo(a.x+len*.07,a.y+(b.y-a.y)*.2,b.x,b.y);ctx.stroke();
    }
    ctx.setLineDash([]);ctx.globalAlpha=1;ctx.restore();
  }
  function draw() {
    const dpr=Math.min(devicePixelRatio||1,2);ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,width,height);
    const world=width<=600?760:1200;scale=width/world;
    // Preserve useful bloom size on desktop; mobile uses six complete plants.
    const unit=width<=600?scale:Math.min(scale,1.2), bottom=height;
    let visible=0;const stages=[],rulers=[];
    for(const p of plants){
      const local=clamp((progress*1.6-p.id/(plants.length-1)*.65)/.95),stage=Math.round(local*1000)/1000;
      const stemGrowth=smooth(local/.65);stages.push(stage);if(local<=0)continue;visible++;
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
      if(stage!==p.stage||!p.sprite){p.sprite=bloom(p,stage);p.stage=stage}
      const top=stem(p,1,stemGrowth);ctx.translate(top.x,top.y);
      const flutter=reduced.matches?0:params.windStrength*.018*Math.sin(time*1.4+p.phase);
      ctx.rotate(flutter);ctx.scale(p.headScale,p.headScale);ctx.translate(-p.sprite.anchor[0],-p.sprite.anchor[1]);ctx.drawImage(p.sprite,-130,-175,260,300);ctx.restore();
    }
    // Read-only observations for verification; input still uses the production UI.
    canvas.dataset.progress=progress.toFixed(6);canvas.dataset.plants=visible;canvas.dataset.stages=JSON.stringify(stages);canvas.dataset.seed=params.seed;
    canvas.dataset.intro=intro;canvas.dataset.rulers=JSON.stringify(rulers);
    canvas.dataset.time=time.toFixed(4);canvas.dataset.frame=String(Number(canvas.dataset.frame||0)+1);
    dirty=false;
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
