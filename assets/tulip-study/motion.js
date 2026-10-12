(() => {
  const svg=document.querySelector('svg'),button=document.querySelector('button');
  const ns='http://www.w3.org/2000/svg',reduce=matchMedia('(prefers-reduced-motion: reduce)');
  const specs=[
    {name:'petal',a:[436,52],b:[308,309],c:[550,210],label:[575,92],phase:0},
    {name:'bloom',a:[450,665],b:[879,488],c:[641,667],label:[780,812],phase:1.5},
    {name:'leaf',a:[76,680],b:[340,1115],c:[310,946],label:[52,1194],phase:3}
  ];
  function node(tag,attrs){const el=document.createElementNS(ns,tag);Object.entries(attrs).forEach(([k,v])=>el.setAttribute(k,v));svg.append(el);return el}
  const groups=specs.map(s=>({s,path:node('path',{}),leader:node('line',{}),dots:[0,1,2].map(()=>node('circle',{r:5})),box:node('rect',{x:s.label[0]-10,y:s.label[1]-27,width:240,height:39}),text:node('text',{x:s.label[0],y:s.label[1]})}));
  function draw(t){groups.forEach(({s,path,leader,dots,text})=>{
    const p=t*2*Math.PI/4000+s.phase;
    const c=[s.c[0]+14*Math.sin(p),s.c[1]+10*Math.cos(p)];
    const points=[s.a,s.b,c];path.setAttribute('d',`M${s.a} L${s.b} L${c} Z`);
    points.forEach(([x,y],i)=>{dots[i].setAttribute('cx',x);dots[i].setAttribute('cy',y)});
    leader.setAttribute('x1',c[0]);leader.setAttribute('y1',c[1]);leader.setAttribute('x2',s.label[0]);leader.setAttribute('y2',s.label[1]-8);
    const u=[s.a[0]-c[0],s.a[1]-c[1]],v=[s.b[0]-c[0],s.b[1]-c[1]];
    const angle=Math.acos(Math.max(-1,Math.min(1,(u[0]*v[0]+u[1]*v[1])/(Math.hypot(...u)*Math.hypot(...v)))))*180/Math.PI;
    text.textContent=`${s.name} ${angle.toFixed(1)}°`;
  })}
  let paused=false,visible=true,raf=null,last=null,elapsed=0;
  function stop(){if(raf!==null)cancelAnimationFrame(raf);raf=null;last=null}
  function tick(now){if(last!==null)elapsed+=now-last;last=now;draw(elapsed);raf=requestAnimationFrame(tick)}
  function start(){stop();if(!paused&&visible&&!document.hidden&&!reduce.matches)raf=requestAnimationFrame(tick)}
  button.addEventListener('click',()=>{paused=!paused;button.textContent=paused?'play':'pause';button.setAttribute('aria-pressed',String(paused));start()});
  document.addEventListener('visibilitychange',start);reduce.addEventListener('change',()=>{draw(0);elapsed=0;start()});
  new IntersectionObserver(([e])=>{visible=e.isIntersecting;start()}).observe(svg);draw(0);start();
})();
