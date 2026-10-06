import assert from 'node:assert/strict';
import {createMaterial,step,sample,metrics,DT,DURATION} from '../studies/material-model.mjs';
const a=createMaterial(),b=createMaterial();
const area=a.initialArea;
let events=0;
for(let frame=0;frame<Math.round(DURATION/DT);frame++){
 step(a);step(b);
 const m=metrics(a);
 assert(Math.abs(m.area-area)<1e-8,'splitting must preserve represented material area');
 assert(a.nodes.every(n=>[n.x,n.y,n.vx,n.vy,n.mass].every(Number.isFinite)),'material state must remain finite');
 assert(Math.abs(a.nodes.reduce((sum,n)=>sum+n.mass,0)-area)<1e-8,'lumped mass must equal represented area');
 for(const event of a.events.slice(events)){
  const [left,right]=event.ends.map(id=>a.nodes[id]);
  assert.equal(left.x,right.x);assert.equal(left.y,right.y);
  assert.equal(left.vx,right.vx);assert.equal(left.vy,right.vy);
  assert.equal(event.vx,(event.parentV[0]+event.parentV[2])/2);
  assert.equal(event.vy,(event.parentV[1]+event.parentV[3])/2);
 }
 events=a.events.length;
}
assert.deepEqual(a,b,'fixed-step replay must be deterministic');
assert(a.events.length>0,'the stress test must produce separation');
assert(a.edges.every(e=>e.generation<=1),'fracture subdivision remains bounded');
assert(a.nodes.every(n=>n.x>0&&n.x<1200&&n.y>=0&&n.y<800),'material remains within study frame');
const initial=createMaterial();
assert.equal(initial.edges.filter(e=>e.active).length,initial.nodes.length-1,'initial graph is a connected tree by construction');
console.log(JSON.stringify({duration:DURATION,step:DT,events:a.events.length,firstSeparation:a.events[0].time,areaDrift:metrics(a).area/area-1,checks:'area, lumped mass, inherited velocity, finite state, replay, bounds'},null,2));
