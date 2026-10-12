(() => {
  const svg=document.querySelector('svg'),button=document.querySelector('button');
  const ns='http://www.w3.org/2000/svg',reduce=matchMedia('(prefers-reduced-motion: reduce)');
  const specs=[
    {name:'petal 1',a:[360,235],b:[482,174],c:[439,48],label:[550,65]},
    {name:'petal 2',a:[833,306],b:[980,316],c:[925,229],label:[728,152]},
    {name:'leaf tip',a:[167,849],b:[272,870],c:[80,682],label:[50,612]},
    {name:'stem bend',a:[480,831],b:[472,1154],c:[425,1015],label:[550,1050]}
  ];
  function node(tag,attrs){const el=document.createElementNS(ns,tag);Object.entries(attrs).forEach(([k,v])=>el.setAttribute(k,v));svg.append(el);return el}
  const groups=specs.map(s=>{
    node('path',{d:`M${s.a} L${s.c} L${s.b}`,fill:'none'});
    node('line',{x1:s.c[0],y1:s.c[1],x2:s.label[0],y2:s.label[1]-8});
    [s.a,s.b,s.c].forEach(([cx,cy])=>node('circle',{cx,cy,r:4}));
    const u=[s.a[0]-s.c[0],s.a[1]-s.c[1]],v=[s.b[0]-s.c[0],s.b[1]-s.c[1]];
    const angle=Math.acos(Math.max(-1,Math.min(1,(u[0]*v[0]+u[1]*v[1])/(Math.hypot(...u)*Math.hypot(...v)))))*180/Math.PI;
    node('rect',{x:s.label[0]-10,y:s.label[1]-30,width:350,height:43});
    const label=node('text',{x:s.label[0],y:s.label[1]});label.textContent=`${s.name} ${angle.toFixed(1)}°`;
    return {s,marker:node('circle',{r:5,style:'fill:#C5B5EC'})};
  });
  function draw(t){groups.forEach(({s,marker},i)=>{
    // Travel out and back along the same measured edges; landmarks remain fixed.
    const progress=(1-Math.cos(t*2*Math.PI/4000+i*.8))/2;
    const a=progress<.5?s.a:s.c,b=progress<.5?s.c:s.b,u=progress<.5?progress*2:(progress-.5)*2;
    marker.setAttribute('cx',a[0]+(b[0]-a[0])*u);marker.setAttribute('cy',a[1]+(b[1]-a[1])*u);
  })}
  let paused=false,visible=true,raf=null,last=null,elapsed=0;
  function stop(){if(raf!==null)cancelAnimationFrame(raf);raf=null;last=null}
  function tick(now){if(last!==null)elapsed+=now-last;last=now;draw(elapsed);raf=requestAnimationFrame(tick)}
  function start(){stop();if(!paused&&visible&&!document.hidden&&!reduce.matches)raf=requestAnimationFrame(tick)}
  button.addEventListener('click',()=>{paused=!paused;button.textContent=paused?'play':'pause';button.setAttribute('aria-pressed',String(paused));start()});
  document.addEventListener('visibilitychange',start);reduce.addEventListener('change',()=>{draw(0);elapsed=0;start()});
  new IntersectionObserver(([e])=>{visible=e.isIntersecting;start()}).observe(svg);draw(0);start();
})();
