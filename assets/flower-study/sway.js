(() => {
  const canvas=document.querySelector('canvas'),ctx=canvas.getContext('2d'),button=document.querySelector('button');
  const image=new Image(),reduce=matchMedia('(prefers-reduced-motion: reduce)');
  let raf=null,last=null,time=0,paused=false,visible=true,ready=false;
  const margin=24;
  function draw(ms){
    ctx.fillStyle='#000000';ctx.fillRect(0,0,canvas.width,canvas.height);
    const phase=ms*Math.PI*2/8000;
    // A continuous bend grows from zero at the roots; a small secondary
    // oscillation gives the upper stems a soft follow-through.
    for(let y=0;y<image.height;y+=2){
      const height=Math.min(2,image.height-y),u=1-(y+height/2)/image.height;
      const bend=reduce.matches?0:Math.pow(u,1.65)*(16*Math.sin(phase-.45*u)+3*Math.sin(2*phase-.8*u));
      ctx.drawImage(image,0,y,image.width,height,margin+bend,y+margin,image.width,height);
    }
  }
  function stop(){if(raf!==null)cancelAnimationFrame(raf);raf=null;last=null}
  function tick(now){if(last!==null)time+=now-last;last=now;draw(time);raf=requestAnimationFrame(tick)}
  function start(){stop();if(ready&&visible&&!paused&&!document.hidden&&!reduce.matches)raf=requestAnimationFrame(tick)}
  button.addEventListener('click',()=>{paused=!paused;button.textContent=paused?'play':'pause';button.setAttribute('aria-pressed',String(paused));start()});
  document.addEventListener('visibilitychange',start);
  reduce.addEventListener('change',()=>{time=0;if(ready)draw(0);start()});
  new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;start()}).observe(canvas);
  image.onload=()=>{canvas.width=image.width+margin*2;canvas.height=image.height+margin*2;ready=true;draw(0);start()};
  image.src='flowers.png';
})();
