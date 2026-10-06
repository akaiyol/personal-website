// Static reference translation only. All visible artwork is Unicode U+2800–U+28FF.
// Raster input establishes the approved foam mask; it is not the production renderer.
const art = document.querySelector('#foam');
const plate = document.querySelector('.plate');
const status = document.querySelector('#status');
const download = document.querySelector('#download');
const reference = new Image();
const motion = document.body.dataset.study === 'deformation';
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const toggle = document.querySelector('#toggle');
const timeline = document.querySelector('#timeline');
const phaseLabel = document.querySelector('#phase');
let elapsed=0, playing=motion&&!reduced.matches, previous=null, lastPaint=0;
const duration=8;
// A bounded, prescribed material-coordinate test; not a selected ocean model.
function displacement(x,y,t) {
  const q=2*Math.PI*(t%duration)/duration;
  const active=Math.exp(-(((x-.48)/.4)**4))*Math.exp(-(((y-.31)/.32)**4));
  const lip=Math.exp(-(((x-.65)/.2)**2))*Math.exp(-(((y-.35)/.23)**2));
  return [active*.028*Math.sin(q)+lip*.027*(1-Math.cos(q)),
          -active*.045*Math.sin(q)+lip*.042*(1-Math.cos(q))];
}
function materialPoint(x,y,t) {
  let u=x,v=y;
  for(let n=0;n<5;n++) {
    const [dx,dy]=displacement(u,v,t);u=x-dx;v=y-dy;
  }
  return [u,v];
}
function updateControls() {
  if(!motion) return;
  toggle.textContent=playing?'Pause':'Play';
  timeline.value=elapsed.toFixed(2);
  const phase=elapsed<2?'rise':elapsed<4?'curl':elapsed<6?'fall':'recover';
  phaseLabel.textContent=`${elapsed.toFixed(1)} s / ${duration} s · ${phase}`;
}
if(motion) {
  toggle.addEventListener('click',()=>{playing=!playing;previous=null;updateControls();});
  timeline.addEventListener('input',()=>{playing=false;elapsed=Number(timeline.value);updateControls();render();});
  reduced.addEventListener('change',()=>{playing=false;elapsed=0;previous=null;updateControls();render();});
  document.addEventListener('visibilitychange',()=>{previous=null;});
  updateControls();
}
function tick(now) {
  if(motion && playing && !document.hidden && integral) {
    if(previous!==null) elapsed=(elapsed+Math.min((now-previous)/1000,.1))%duration;
    previous=now;
    if(now-lastPaint>=50) {render();updateControls();lastPaint=now;}
  } else previous=null;
  if(motion) requestAnimationFrame(tick);
}
if(motion) requestAnimationFrame(tick);
const bits = [[0,0,0],[0,1,1],[0,2,2],[1,0,3],[1,1,4],[1,2,5],[0,3,6],[1,3,7]];
let integral, sourceWidth, sourceHeight, objectURL;
function sum(x0,y0,x1,y1) {
  const stride=sourceWidth+1;
  return integral[y1*stride+x1]-integral[y0*stride+x1]-integral[y1*stride+x0]+integral[y0*stride+x0];
}
function render() {
  if (!integral) return;
  const probe=document.createElement('span');
  probe.textContent='⣿'.repeat(100);
  probe.style.cssText=`position:absolute;visibility:hidden;white-space:pre;font:${getComputedStyle(art).font}`;
  plate.append(probe);
  const cell=probe.getBoundingClientRect().width/100;
  probe.remove();
  const columns=Math.floor(plate.clientWidth/cell);
  const rowHeight=parseFloat(getComputedStyle(art).lineHeight);
  const rows=Math.floor(plate.clientHeight/rowHeight);
  const w=columns*2,h=rows*4;
  const mask=new Uint8Array(w*h);
  let occupied=0;
  for(let y=0;y<h;y++) for(let x=0;x<w;x++) {
    const [u,v]=motion?materialPoint((x+.5)/w,(y+.5)/h,elapsed):[(x+.5)/w,(y+.5)/h];
    if(u<0||u>=1||v<0||v>=1) continue;
    const x0=Math.max(0,Math.floor((u-.5/w)*sourceWidth));
    const x1=Math.min(sourceWidth,Math.max(x0+1,Math.floor((u+.5/w)*sourceWidth)));
    const y0=Math.max(0,Math.floor((v-.5/h)*sourceHeight));
    const y1=Math.min(sourceHeight,Math.max(y0+1,Math.floor((v+.5/h)*sourceHeight)));
    const coverage=sum(x0,y0,x1,y1)/((x1-x0)*(y1-y0));
    // Area coverage preserves narrow foam at small sizes; no per-frame noise.
    const on=coverage>=0.16;
    mask[y*w+x]=on;
    occupied+=on;
  }
  const output=[];
  for(let row=0;row<rows;row++) {
    let text='';
    for(let col=0;col<columns;col++) {
      let code=0;
      for(const [dx,dy,bit] of bits) if(mask[(row*4+dy)*w+col*2+dx]) code|=1<<bit;
      text+=String.fromCharCode(0x2800+code);
    }
    output.push(text);
  }
  const text=output.join('\n');
  art.textContent=text;
  art.dataset.columns=columns; art.dataset.rows=rows;
  art.dataset.dotOccupancy=(occupied/(w*h)).toFixed(4);
  art.dataset.phase=elapsed.toFixed(3);
  status.textContent=`${columns} × ${rows} characters · ${w} × ${h} dot samples · foam only`;
  if(download) {
    if(objectURL) URL.revokeObjectURL(objectURL);
    objectURL=URL.createObjectURL(new Blob([text+'\n'],{type:'text/plain;charset=utf-8'}));
    download.href=objectURL;
  }
}
reference.onload=async()=>{
  await document.fonts.load('10px WaveBraille','⣿');
  sourceWidth=reference.naturalWidth; sourceHeight=reference.naturalHeight;
  const canvas=document.createElement('canvas'); canvas.width=sourceWidth;canvas.height=sourceHeight;
  const context=canvas.getContext('2d',{willReadFrequently:true});
  context.drawImage(reference,0,0);
  const data=context.getImageData(0,0,sourceWidth,sourceHeight).data;
  integral=new Uint32Array((sourceWidth+1)*(sourceHeight+1));
  for(let y=0;y<sourceHeight;y++) {
    let running=0;
    for(let x=0;x<sourceWidth;x++) {
      running+=data[(y*sourceWidth+x)*4]>70?1:0;
      integral[(y+1)*(sourceWidth+1)+x+1]=integral[y*(sourceWidth+1)+x+1]+running;
    }
  }
  render();
};
reference.onerror=()=>{status.textContent='The approved reference could not be loaded. Reload to retry.';download?.removeAttribute('href');};
reference.src='../artifacts/references/wave-approved-2026-10-06.png';
new ResizeObserver(render).observe(plate);
