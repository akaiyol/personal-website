(() => {
  const host=document.querySelector('.timeline-flowers');if(!host)return;
  const ns='http://www.w3.org/2000/svg';
  const source=new URL('flowers.png',document.currentScript.src).href;
  const svg=document.createElementNS(ns,'svg');svg.setAttribute('viewBox','0 0 1200 440');svg.setAttribute('aria-hidden','true');host.replaceChildren(svg);
  function el(tag,attrs={},parent=svg){const n=document.createElementNS(ns,tag);for(const [k,v] of Object.entries(attrs))n.setAttribute(k,v);parent.append(n);return n}
  const defs=el('defs');el('image',{id:'original-flower-source',href:source,width:1155,height:1362},defs);
  // Use only complete, non-overlapping blooms from the first approved study.
  // Preserve its dotwork rather than cropping the interwoven reference cluster.
  const parts=[
    {name:'open-bloom',root:[260,390],outline:'25,165 350,165 350,200 425,199 432,222 495,250 505,340 360,340 330,402 25,402'},
    {name:'upright-bloom',root:[531,305],outline:'345,60 880,60 880,358 772,358 724,311 634,302 550,320 510,307 501,261 490,225 430,195 345,190',exclude:'630,251 670,251 670,242 900,242 900,370 755,370 755,269 630,269'},
    {name:'side-bloom',root:[519,545],outline:'350,357 509,357 509,380 534,380 534,357 825,357 825,555 500,555 495,522 410,522 350,495',exclude:'635,468 850,468 850,580 705,580 705,478 635,478',tilt:-6}
  ];
  // Keep lavender dot cores and black negative space; no shaded petal surfaces.
  const palette=el('filter',{id:'flower-palette','color-interpolation-filters':'sRGB'},defs);
  el('feColorMatrix',{type:'matrix',values:'0 0 0 0 .77255 0 0 0 0 .70980 0 0 0 0 .92549 .2126 .7152 .0722 0 0'},palette);
  const transfer=el('feComponentTransfer',{},palette);el('feFuncA',{type:'linear',slope:1.7,intercept:-.15},transfer);
  parts.forEach((p,i)=>{
    const clip=el('clipPath',{id:'flower-part-'+i},defs);el('polygon',{points:p.outline},clip);
    const contour=points=>'M'+points.trim().replaceAll(' ',' L')+' Z';
    if(p.exclude){const cut=el('clipPath',{id:'flower-trim-'+i},defs);el('path',{d:'M0 0 H1155 V1362 H0 Z '+contour(p.exclude),'clip-rule':'evenodd'},cut)}
    const symbol=el('g',{id:'flower-head-'+i},defs);
    const frame=el('g',{transform:`translate(${-p.root[0]} ${-p.root[1]})`},symbol);
    // End the source at its attachment; the vector stem continues from here.
    const rootClip=el('clipPath',{id:'flower-root-'+i},defs);el('rect',{x:0,y:0,width:1155,height:p.root[1]},rootClip);
    const rooted=el('g',{'clip-path':`url(#flower-root-${i})`},frame);
    const crop=el('g',{'clip-path':`url(#flower-part-${i})`},rooted);
    el('use',{href:'#original-flower-source',...(p.exclude?{'clip-path':`url(#flower-trim-${i})`}:{}),filter:'url(#flower-palette)'},crop);
  });
  const leaves=[
    ['45,425 200,425 200,510 45,510',199,498],
    ['275,1180 405,1180 420,1198 420,1305 275,1305',419,1207]
  ];
  leaves.forEach(([outline,x,y],i)=>{const clip=el('clipPath',{id:'original-leaf-'+i},defs);el('polygon',{points:outline},clip);const leaf=el('g',{id:'flower-leaf-'+i},defs);el('use',{href:'#original-flower-source','clip-path':`url(#original-leaf-${i})`,transform:`translate(${-x} ${-y})`,filter:'url(#flower-palette)'},leaf)});
  const plants=[];
  // Stable pseudo-random variation keeps the composition still between frames.
  const variation=seed=>{const v=Math.sin(seed*127.1+311.7)*43758.5453;return v-Math.floor(v)};
  // Deliberately irregular, stable layout; height, lean and spacing differ per plant.
  const layout=[
    [0,145,245,.38,-9,0], [2,205,150,.34,10,1.6], [1,304,302,.36,-5,3.2],
    [2,417,222,.39,7,4.8], [0,490,145,.31,-12,2.2], [1,600,278,.38,5,5.6],
    [0,714,205,.35,10,.9], [2,838,286,.38,1,3.9], [2,920,158,.32,-10,5.1],
    [1,1014,265,.33,7,2.8], [0,1103,141,.29,-5,6.4]
  ];
  layout.forEach(([part,x,length,scale,lean,phase],i)=>{
    const p=parts[part],plant=el('g',{'data-flower':p.name,style:'mix-blend-mode:screen'});
    const stem=el('path',{d:`M0 0 C${-lean*.55} ${-length*.34},${lean*.7} ${-length*.72},0 ${-length}`,fill:'none',stroke:'#C5B5EC','stroke-width':1.2,'stroke-dasharray':'.35 2.2','stroke-linecap':'round'},plant);
    const head=el('g',{},plant);el('use',{href:'#flower-head-'+part,transform:`scale(${scale})`},head);
    const leafGroups=[0,1].map(j=>{
      const seed=i*7+j*31+1,height=j===0?.23+variation(seed)*.15:.49+variation(seed+3)*.15;
      const direction=(i+j)%2?1:-1,leafScale=.24+variation(seed+5)*.13;
      const group=el('g',{'data-stem-leaf':j},plant);
      el('use',{href:'#flower-leaf-'+Math.floor(variation(seed+9)*leaves.length),transform:`scale(${direction*leafScale} ${leafScale})`},group);
      let position=height;
      for(let k=0;k<5;k++){const u=1-position,y=3*u*u*position*.34+3*u*position*position*.72+position**3,dy=1.02*u*u+2.28*u*position+.84*position*position;position-= (y-height)/dy}
      return {group,height,position,direction,angle:-20+variation(seed+11)*40,phase:variation(seed+13)*Math.PI*2,speed:1.55+variation(seed+15)*.6};
    });
    // Ruler labels describe normalized height along each individual stem.
    const ruler=el('g',{'data-stem-ruler':''},plant),marks=[];
    for(let j=2;j<=16;j++){
      const height=j/20,major=j%4===0;
      let position=height;
      for(let k=0;k<5;k++){const u=1-position,y=3*u*u*position*.34+3*u*position*position*.72+position**3,dy=1.02*u*u+2.28*u*position+.84*position*position;position-=(y-height)/dy}
      const h=position,bend=3*(1-h)*(1-h)*h*(-lean*.55)+3*(1-h)*h*h*(lean*.7);
      const nearby=leafGroups.find(leaf=>Math.abs(leaf.height-height)<.1);
      const side=nearby?nearby.direction:1;
      const mark=el('g',{transform:`translate(${bend} ${-length*height})`},ruler);
      const tick=el('path',{fill:'none',stroke:'#C5B5EC','stroke-width':.7},mark);
      const label=major?el('text',{fill:'#C5B5EC','font-family':'Menlo,Consolas,monospace','text-anchor':side<0?'end':'start','dominant-baseline':'central'},mark):null;
      if(label)label.textContent=height.toFixed(2).slice(1);
      marks.push({tick,label,major,side});
    }
    plants.push({plant,head,leafGroups,marks,x,length,lean,phase,i,headAngle:p.tilt||0});
  });
  const reduce=matchMedia('(prefers-reduced-motion: reduce)'),narrow=matchMedia('(max-width:600px)');
  let raf=null,last=null,time=0,visible=false;
  function draw(ms){const t=ms/1000;
    svg.setAttribute('viewBox',narrow.matches?'0 0 760 440':'0 0 1200 440');
    plants.forEach(p=>{
      const mobileOrder=[0,2,3,5,8,9],slot=mobileOrder.indexOf(p.i);
      p.plant.style.display=narrow.matches&&slot<0?'none':'';
      // Inline label sizing overrides unscoped text rules in embedded avatar SVGs.
      p.marks.forEach(({tick,label,major,side})=>{
        const reach=(major?6:3)*(narrow.matches?1.35:1);
        tick.setAttribute('d',`M${-side*1.5} 0H${side*reach}`);
        if(label){label.setAttribute('x',side*(reach+(narrow.matches?5:3)));label.style.fontSize=(narrow.matches?16:10)+'px'}
      });
      const x=narrow.matches?[150,260,365,455,560,620][slot]||p.x:p.x;
      const sway=reduce.matches?0:1.15*Math.sin(t*.78+p.phase)+.2*Math.sin(t*1.3+p.phase);
      p.plant.setAttribute('transform',`translate(${x} 440) rotate(${p.lean+sway})`);
      const flutter=reduce.matches?0:.65*Math.sin(t*(2.1+p.i*.073)+p.phase);
      p.head.setAttribute('transform',`translate(0 ${-p.length}) rotate(${p.headAngle+flutter})`);
      p.leafGroups.forEach(leaf=>{
        const h=leaf.position,bend=3*(1-h)*(1-h)*h*(-p.lean*.55)+3*(1-h)*h*h*(p.lean*.7);
        const angle=leaf.angle+(reduce.matches?0:2*Math.sin(t*leaf.speed+leaf.phase));
        leaf.group.setAttribute('transform',`translate(${bend} ${-p.length*leaf.height}) rotate(${angle})`);
      });
    });
  }
  function stop(){if(raf!==null)cancelAnimationFrame(raf);raf=null;last=null}
  function tick(now){if(last!==null)time+=now-last;last=now;draw(time);raf=requestAnimationFrame(tick)}
  function start(){stop();if(visible&&!document.hidden&&!reduce.matches)raf=requestAnimationFrame(tick)}
  new IntersectionObserver(([e])=>{visible=e.isIntersecting;start()}).observe(svg);
  document.addEventListener('visibilitychange',start);reduce.addEventListener('change',()=>{draw(time);start()});narrow.addEventListener('change',()=>draw(time));draw(0);
})();
