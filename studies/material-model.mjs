// Reduced connected-ligament experiment, not a fluid solver.
export const DT=1/240, DURATION=9;
const mix=(a,b,t)=>a+(b-a)*t;
export function createMaterial(){
 const s={time:0,nodes:[],edges:[],events:[],initialArea:0};
 const node=(x,y,pinned=false)=>{const n={id:s.nodes.length,x,y,ox:x,oy:y,vx:0,vy:0,mass:0,pinned};s.nodes.push(n);return n.id;};
 const edge=(a,b,width,threshold=2.1)=>{const A=s.nodes[a],B=s.nodes[b],rest=Math.hypot(A.x-B.x,A.y-B.y);s.edges.push({id:s.edges.length,a,b,rest,area:rest*width,threshold,active:true,generation:0,strained:0});};
 let seed=270627;const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 // One shared crown. Branches inherit the same material graph, not independent icons.
 const backbone=[];
 for(let i=0;i<=38;i++){
  const t=i/38,x=100+660*t,y=590-470*Math.sin(t*Math.PI*.72);
  backbone.push(node(x,y,i<6));
  if(i)edge(backbone[i-1],backbone[i],30+24*Math.sin(t*Math.PI),3.2);
 }
 for(let k=10;k<38;k+=2+Math.floor(rand()*3)){
  let parent=backbone[k];const root=s.nodes[parent],length=48+rand()*87,reach=20+rand()*49;
  const count=7+Math.floor(rand()*4), width=12+rand()*13, chain=[parent];
  for(let j=1;j<=count;j++){
   const t=j/count,x=root.x+reach*Math.sin(t*Math.PI*.8),y=root.y+length*t;
   const child=node(x,y);edge(parent,child,width*(1-.78*t),1.55+rand()*.36);chain.push(child);parent=child;
  }
  if(rand()>.2){
   const at=Math.floor(count*(.35+rand()*.3)),r=s.nodes[chain[at]];parent=r.id;
   const side=rand()>.5?1:-1;
   for(let j=1;j<=4;j++){
    const t=j/4, child=node(r.x+side*(20+reach*.22)*Math.sin(t*2),r.y+length*.4*t);
    edge(parent,child,width*.42*(1-.8*t),1.55+rand()*.2);parent=child;
   }
  }
 }
 s.initialArea=s.edges.reduce((a,e)=>a+e.area,0);rebuildMass(s);return s;
}
function rebuildMass(s){for(const n of s.nodes)n.mass=0;for(const e of s.edges)if(e.active){s.nodes[e.a].mass+=e.area/2;s.nodes[e.b].mass+=e.area/2;}}
function fracture(s,e){
 const a=s.nodes[e.a],b=s.nodes[e.b],x=(a.x+b.x)/2,y=(a.y+b.y)/2,vx=(a.vx+b.vx)/2,vy=(a.vy+b.vy)/2;
 const l=s.nodes.length,r=l+1;
 for(const id of [l,r])s.nodes.push({id,x,y,ox:x,oy:y,vx,vy,mass:0,pinned:false});
 e.active=false;
 for(const [start,end] of [[e.a,l],[r,e.b]])s.edges.push({...e,id:s.edges.length,a:start,b:end,rest:e.rest/2,area:e.area/2,active:true,generation:1,strained:0});
 s.events.push({time:s.time,edge:e.id,ends:[l,r],x,y,vx,vy,parentV:[a.vx,a.vy,b.vx,b.vy],area:e.area});
 rebuildMass(s);
}
export function step(s,dt=DT){
 s.time+=dt;
 const force=s.nodes.map(()=>({x:0,y:0}));
 for(const e of s.edges){if(!e.active)continue;const a=s.nodes[e.a],b=s.nodes[e.b],dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy)||1;
  const extension=(len-e.rest)/e.rest;
  const relative=((b.vx-a.vx)*dx+(b.vy-a.vy)*dy)/len;
  const strength=e.area*(24*extension+0.07*relative);
  const fx=dx/len*strength,fy=dy/len*strength;
  force[e.a].x+=fx;force[e.a].y+=fy;force[e.b].x-=fx;force[e.b].y-=fy;
  e.strained=len/e.rest>e.threshold?e.strained+dt:0;
 }
 for(const n of s.nodes){
  if(n.pinned){const t=Math.min(s.time,4),lift=Math.sin(Math.PI*t/4);const x=n.ox+42*lift,y=n.oy-28*lift;n.vx=(x-n.x)/dt;n.vy=(y-n.y)/dt;n.x=x;n.y=y;continue;}
  const f=force[n.id],m=Math.max(5,n.mass),fade=Math.max(0,1-s.time/3);
  // Bounded excitation launches the sheet; local stretch comes from shared forces.
  n.vx+=(f.x/m+35*fade)*dt;n.vy+=(f.y/m+42-68*fade)*dt;
  const drag=Math.exp(-.12*dt);n.vx*=drag;n.vy*=drag;
  n.x+=n.vx*dt;n.y+=n.vy*dt;
  if(n.y>635){n.y=635;n.vy=-Math.abs(n.vy)*.14;n.vx*=Math.exp(-2*dt);}
 }
 // Split strained original bonds into two half-ligaments with coincident free ends.
 // Their inherited velocity is identical at separation; subsequent tension/gravity opens the gap.
 const failing=s.edges.filter(e=>e.active&&e.generation===0&&e.strained>.07);
 for(const e of failing.slice(0,4))fracture(s,e);
}
export function sample(t){const s=createMaterial();for(let i=0;i<Math.round(t/DT);i++)step(s);return s;}
export function metrics(s){
 const active=s.edges.filter(e=>e.active);
 return {nodes:s.nodes.length,bonds:active.length,fractures:s.events.length,area:active.reduce((a,e)=>a+e.area,0),initialArea:s.initialArea,maxStretch:Math.max(...active.map(e=>Math.hypot(s.nodes[e.a].x-s.nodes[e.b].x,s.nodes[e.a].y-s.nodes[e.b].y)/e.rest))};
}
