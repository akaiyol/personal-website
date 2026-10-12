(() => {
  const host=document.querySelector('.timeline-flowers');if(!host)return;
  const ns='http://www.w3.org/2000/svg';
  const source=new URL('reference-flowers.png',document.currentScript.src).href;
  const svg=document.createElementNS(ns,'svg');svg.setAttribute('viewBox','0 0 1200 440');svg.setAttribute('aria-hidden','true');host.replaceChildren(svg);
  function el(tag,attrs={},parent=svg){const n=document.createElementNS(ns,tag);for(const [k,v] of Object.entries(attrs))n.setAttribute(k,v);parent.append(n);return n}
  const defs=el('defs');el('image',{id:'original-flower-source',href:source,width:1436,height:1694},defs);
  // Source-space masks retain the approved artwork's original pixels.
  // Each head is independent; stems are completed from its own attachment.
  const parts=[
    {name:'wide-left',root:[324,525],outline:'100,380 158,330 235,323 389,328 477,347 473,399 418,438 385,487 325,531 283,490 241,447 110,454'},
    {name:'upright-center',root:[638,548],outline:'472,350 528,275 671,271 714,326 716,373 797,390 780,435 721,453 701,504 650,552 607,540 588,484 563,463 484,453'},
    {name:'side-right',root:[808,646],outline:'691,467 835,446 926,465 1005,470 1010,534 931,554 883,596 850,630 809,651 766,613 742,578 685,541'},
    {name:'large-low',root:[1101,1107],outline:'844,903 928,841 1030,841 1080,880 1177,881 1241,910 1220,948 1277,967 1279,1000 1216,1011 1190,1066 1124,1110 1080,1094 1032,1058 960,1084 904,1029 919,986 849,967'},
    {name:'front-low',root:[1140,1220],outline:'966,1064 1033,1025 1094,1043 1139,1078 1209,1108 1243,1147 1230,1197 1180,1218 1130,1230 1077,1209 1045,1160 993,1122'},
    {name:'small-right',root:[1295,1149],outline:'1190,997 1265,981 1350,999 1426,1038 1434,1107 1400,1126 1344,1116 1317,1156 1270,1155 1240,1126 1205,1092'}
  ];
  // Convert the credited reference to lavender without changing its petal shapes.
  const palette=el('filter',{id:'flower-palette','color-interpolation-filters':'sRGB'},defs);
  el('feColorMatrix',{type:'matrix',values:'0 0 0 0 .77255 0 0 0 0 .70980 0 0 0 0 .92549 .2126 .7152 .0722 0 0'},palette);
  const transfer=el('feComponentTransfer',{},palette);el('feFuncA',{type:'discrete',tableValues:'0 0 .55 .75 .9 1 1 1'},transfer);
  parts.forEach((p,i)=>{
    const clip=el('clipPath',{id:'flower-part-'+i},defs);el('polygon',{points:p.outline},clip);
    const symbol=el('g',{id:'flower-head-'+i},defs);
    el('use',{href:'#original-flower-source','clip-path':`url(#flower-part-${i})`,transform:`translate(${-p.root[0]} ${-p.root[1]})`,filter:'url(#flower-palette)'},symbol);
  });
  const leaves=[
    ['393,1676 408,1606 446,1562 486,1569 508,1593 480,1626 433,1680',402,1676],
    ['1020,1357 1028,1332 1054,1320 1068,1320 1053,1350 1031,1373',1020,1370],
    ['306,919 318,889 355,864 363,911 337,925',337,925]
  ];
  leaves.forEach(([outline,x,y],i)=>{const clip=el('clipPath',{id:'original-leaf-'+i},defs);el('polygon',{points:outline},clip);const leaf=el('g',{id:'flower-leaf-'+i},defs);el('use',{href:'#original-flower-source','clip-path':`url(#original-leaf-${i})`,transform:`translate(${-x} ${-y})`,filter:'url(#flower-palette)'},leaf)});
  const plants=[];
  // Deliberately irregular, stable layout; height, lean and spacing differ per plant.
  const layout=[
    [0,150,252,.47,-10,0], [5,175,142,.42,12,1.6], [1,269,302,.43,-5,3.2],
    [2,390,190,.47,8,4.8], [4,475,132,.47,-13,2.2], [3,586,265,.46,7,5.6],
    [0,713,194,.40,11,.9], [5,800,288,.44,-9,3.9], [2,914,156,.43,-12,5.1],
    [1,1019,246,.41,8,2.8], [4,1102,137,.42,-5,6.4]
  ];
  layout.forEach(([part,x,length,scale,lean,phase],i)=>{
    const p=parts[part],plant=el('g',{'data-flower':p.name,style:'mix-blend-mode:screen'});
    const stem=el('path',{d:`M0 0 C${-lean*.55} ${-length*.34},${lean*.7} ${-length*.72},0 ${-length}`,fill:'none',stroke:'#C5B5EC','stroke-width':.8,'stroke-linecap':'round'},plant);
    const head=el('g',{},plant);el('use',{href:'#flower-head-'+part,transform:`scale(${scale})`},head);
    const leafGroup=el('g',{},plant);el('use',{href:'#flower-leaf-'+(i%3),transform:`scale(${.26+(i%3)*.035})`},leafGroup);
    // Upright stem numerals retain the original computational drawing language.
    for(let j=1;j<=5;j++){const label=el('text',{x:5,y:-length*j/6,fill:'#C5B5EC','font-size':7,'font-family':'Menlo,Consolas,monospace'},plant);label.textContent=[.83,.64,.5,.33,.17,.92,.76][(i+j)%7].toFixed(2)}
    plants.push({plant,head,leafGroup,x,length,lean,phase,i});
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
      const leafAngle=(p.i%2?-28:22)+(reduce.matches?0:2*Math.sin(t*(1.7+p.i*.059)+p.phase+1));
      p.leafGroup.setAttribute('transform',`translate(0 ${-p.length*.38}) rotate(${leafAngle})`);
    });
  }
  function stop(){if(raf!==null)cancelAnimationFrame(raf);raf=null;last=null}
  function tick(now){if(last!==null)time+=now-last;last=now;draw(time);raf=requestAnimationFrame(tick)}
  function start(){stop();if(visible&&!document.hidden&&!reduce.matches)raf=requestAnimationFrame(tick)}
  new IntersectionObserver(([e])=>{visible=e.isIntersecting;start()}).observe(svg);
  document.addEventListener('visibilitychange',start);reduce.addEventListener('change',()=>{draw(time);start()});narrow.addEventListener('change',()=>draw(time));draw(0);
})();
