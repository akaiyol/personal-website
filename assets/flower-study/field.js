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
    {name:'side-bloom',root:[522,535],outline:'350,357 509,357 509,380 534,380 534,357 825,357 825,555 500,555 495,522 410,522 350,495',exclude:'635,468 850,468 850,580 705,580 705,478 635,478',warp:true}
  ];
  // Keep lavender dot cores and black negative space; no shaded petal surfaces.
  const palette=el('filter',{id:'flower-palette','color-interpolation-filters':'sRGB'},defs);
  el('feColorMatrix',{type:'matrix',values:'0 0 0 0 .77255 0 0 0 0 .70980 0 0 0 0 .92549 .2126 .7152 .0722 0 0'},palette);
  const transfer=el('feComponentTransfer',{},palette);el('feFuncA',{type:'linear',slope:1.7,intercept:-.15},transfer);
  // A continuous displacement softens petal angles without cutting overlapping dotwork.
  const warp=el('filter',{id:'side-petal-shape',filterUnits:'userSpaceOnUse',primitiveUnits:'userSpaceOnUse',x:0,y:0,width:1155,height:1362,'color-interpolation-filters':'sRGB'},defs);
  const map=`<svg xmlns="http://www.w3.org/2000/svg" width="1155" height="1362"><defs><radialGradient id="left"><stop stop-color="rgb(180,38,0)"/><stop offset="1" stop-color="rgb(128,128,0)" stop-opacity="0"/></radialGradient><radialGradient id="right"><stop stop-color="rgb(128,205,0)"/><stop offset="1" stop-color="rgb(128,128,0)" stop-opacity="0"/></radialGradient></defs><path fill="rgb(128,128,0)" d="M0 0H1155V1362H0Z"/><ellipse cx="452" cy="391" rx="80" ry="37" transform="rotate(32 452 391)" fill="url(#left)"/><ellipse cx="685" cy="512" rx="72" ry="27" fill="url(#right)"/></svg>`;
  el('feImage',{href:'data:image/svg+xml,'+encodeURIComponent(map),x:0,y:0,width:1155,height:1362,result:'petal-map'},warp);
  el('feDisplacementMap',{in:'SourceGraphic',in2:'petal-map',scale:36,xChannelSelector:'R',yChannelSelector:'G'},warp);
  parts.forEach((p,i)=>{
    const clip=el('clipPath',{id:'flower-part-'+i},defs);el('polygon',{points:p.outline},clip);
    const contour=points=>'M'+points.trim().replaceAll(' ',' L')+' Z';
    if(p.exclude){const cut=el('clipPath',{id:'flower-trim-'+i},defs);el('path',{d:'M0 0 H1155 V1362 H0 Z '+contour(p.exclude),'clip-rule':'evenodd'},cut)}
    const symbol=el('g',{id:'flower-head-'+i},defs);
    const frame=el('g',{transform:`translate(${-p.root[0]} ${-p.root[1]})`},symbol);
    const shaped=p.warp?el('g',{filter:'url(#side-petal-shape)'},frame):frame;
    const crop=el('g',{'clip-path':`url(#flower-part-${i})`},shaped);
    el('use',{href:'#original-flower-source',...(p.exclude?{'clip-path':`url(#flower-trim-${i})`}:{}),filter:'url(#flower-palette)'},crop);
  });
  const leaves=[
    ['55,489 79,456 111,433 136,435 169,465 186,490 151,496 113,490 79,496',180,490],
    ['281,1297 284,1263 304,1223 344,1193 379,1185 413,1201 382,1226 350,1250 317,1283',410,1203],
    ['416,479 437,460 465,463 487,482 488,511 462,519 433,509 412,492',488,500]
  ];
  leaves.forEach(([outline,x,y],i)=>{const clip=el('clipPath',{id:'original-leaf-'+i},defs);el('polygon',{points:outline},clip);const leaf=el('g',{id:'flower-leaf-'+i},defs);el('use',{href:'#original-flower-source','clip-path':`url(#original-leaf-${i})`,transform:`translate(${-x} ${-y})`,filter:'url(#flower-palette)'},leaf)});
  const plants=[];
  // Stable pseudo-random variation keeps the composition still between frames.
  const variation=seed=>{const v=Math.sin(seed*127.1+311.7)*43758.5453;return v-Math.floor(v)};
  // Deliberately irregular, stable layout; height, lean and spacing differ per plant.
  const layout=[
    [0,145,245,.38,-9,0], [2,205,150,.34,10,1.6], [1,304,302,.36,-5,3.2],
    [2,417,222,.39,7,4.8], [0,490,145,.31,-12,2.2], [1,600,278,.38,5,5.6],
    [0,714,205,.35,10,.9], [2,818,286,.38,-8,3.9], [2,920,158,.32,-10,5.1],
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
      el('use',{href:'#flower-leaf-'+Math.floor(variation(seed+9)*3),transform:`scale(${direction*leafScale} ${leafScale})`},group);
      return {group,height,angle:-20+variation(seed+11)*40,phase:variation(seed+13)*Math.PI*2,speed:1.55+variation(seed+15)*.6};
    });
    // Upright stem numerals retain the original computational drawing language.
    for(let j=1;j<=5;j++){const label=el('text',{x:5,y:-length*j/6,fill:'#C5B5EC','font-size':7,'font-family':'Menlo,Consolas,monospace'},plant);label.textContent=[.83,.64,.5,.33,.17,.92,.76][(i+j)%7].toFixed(2)}
    plants.push({plant,head,leafGroups,x,length,lean,phase,i});
  });
  const reduce=matchMedia('(prefers-reduced-motion: reduce)'),narrow=matchMedia('(max-width:600px)');
  let raf=null,last=null,time=0,visible=false;
  function draw(ms){const t=ms/1000;
    svg.setAttribute('viewBox',narrow.matches?'0 0 760 440':'0 0 1200 440');
    plants.forEach(p=>{
      const mobileOrder=[0,2,3,5,8,9],slot=mobileOrder.indexOf(p.i);
      p.plant.style.display=narrow.matches&&slot<0?'none':'';
      const x=narrow.matches?[150,260,365,455,560,620][slot]||p.x:p.x;
      const sway=reduce.matches?0:1.15*Math.sin(t*.78+p.phase)+.2*Math.sin(t*1.3+p.phase);
      p.plant.setAttribute('transform',`translate(${x} 440) rotate(${p.lean+sway})`);
      const flutter=reduce.matches?0:.65*Math.sin(t*(2.1+p.i*.073)+p.phase);
      p.head.setAttribute('transform',`translate(0 ${-p.length}) rotate(${flutter})`);
      p.leafGroups.forEach(leaf=>{
        const h=leaf.height,bend=3*(1-h)*(1-h)*h*(-p.lean*.55)+3*(1-h)*h*h*(p.lean*.7);
        const angle=leaf.angle+(reduce.matches?0:2*Math.sin(t*leaf.speed+leaf.phase));
        leaf.group.setAttribute('transform',`translate(${bend} ${-p.length*h}) rotate(${angle})`);
      });
    });
  }
  function stop(){if(raf!==null)cancelAnimationFrame(raf);raf=null;last=null}
  function tick(now){if(last!==null)time+=now-last;last=now;draw(time);raf=requestAnimationFrame(tick)}
  function start(){stop();if(visible&&!document.hidden&&!reduce.matches)raf=requestAnimationFrame(tick)}
  new IntersectionObserver(([e])=>{visible=e.isIntersecting;start()}).observe(svg);
  document.addEventListener('visibilitychange',start);reduce.addEventListener('change',()=>{draw(time);start()});narrow.addEventListener('change',()=>draw(time));draw(0);
})();
