import {createMaterial,step,sample,metrics,DT,DURATION} from './material-model.mjs';
const art=document.querySelector('#foam'),plate=document.querySelector('.plate'),slider=document.querySelector('#timeline'),button=document.querySelector('#toggle'),status=document.querySelector('#status'),phase=document.querySelector('#phase');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let s=createMaterial(),playing=!reduced.matches,last=null,acc=0,paint=0,w=0,h=0;
const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d',{willReadFrequently:true});
const dots=[[0,0,0],[0,1,1],[0,2,2],[1,0,3],[1,1,4],[1,2,5],[0,3,6],[1,3,7]];
function render(){if(!w)return;ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,w,h);ctx.save();ctx.scale(w/1200,h/800);ctx.strokeStyle='#fff';ctx.lineCap='round';
 for(const e of s.edges){if(!e.active)continue;const a=s.nodes[e.a],b=s.nodes[e.b],length=Math.max(1,Math.hypot(b.x-a.x,b.y-a.y));ctx.lineWidth=Math.min(e.rest?e.area/e.rest*1.6:40,e.area/length);ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();}
 ctx.restore();const pixels=ctx.getImageData(0,0,w,h).data,rows=[];
 for(let y=0;y<h;y+=4){let row='';for(let x=0;x<w;x+=2){let mask=0;for(const [dx,dy,bit]of dots){if(pixels[((y+dy)*w+x+dx)*4+3]>110)mask|=1<<bit;}row+=String.fromCharCode(0x2800+mask);}rows.push(row);}
 art.textContent=rows.join('\n');art.dataset.time=s.time.toFixed(3);art.dataset.fractures=s.events.length;
 const m=metrics(s);status.textContent=`${m.fractures} separations · material area drift ${Math.abs(m.area/m.initialArea-1).toExponential(1)} · ${w/2} × ${h/4} characters`;
 slider.value=s.time.toFixed(2);phase.textContent=`${s.time.toFixed(1)} s / ${DURATION} s`;button.textContent=playing?'Pause':s.time>=DURATION-DT/2?'Replay':'Play';}
async function resize(){await document.fonts.load('10px WaveBraille','⣿');const size=parseFloat(getComputedStyle(art).fontSize);w=Math.floor(plate.clientWidth/(size*.5))*2;h=Math.floor(plate.clientHeight/size)*4;canvas.width=w;canvas.height=h;render();}
button.addEventListener('click',()=>{if(s.time>=DURATION-DT/2)s=createMaterial();playing=!playing;last=null;render();});
slider.addEventListener('input',()=>{playing=false;s=sample(Number(slider.value));acc=0;last=null;render();});
reduced.addEventListener('change',()=>{playing=false;s=createMaterial();acc=0;last=null;render();});
document.addEventListener('visibilitychange',()=>{last=null;acc=0;});
function tick(now){if(playing&&!document.hidden){if(last!==null)acc+=Math.min(.08,(now-last)/1000);last=now;while(acc>=DT&&s.time<DURATION){step(s);acc-=DT;}if(s.time>=DURATION-DT/2){playing=false;render();}else if(now-paint>50){render();paint=now;}}else last=null;requestAnimationFrame(tick);}
new ResizeObserver(resize).observe(plate);requestAnimationFrame(tick);
