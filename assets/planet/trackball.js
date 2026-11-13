// Screen-space virtual trackball. Quaternions are [x,y,z,w]; velocity is radians/s.
export const identity=()=>[0,0,0,1];
export function normalize(q){const n=Math.hypot(...q);return n>1e-12?q.map(v=>v/n):identity();}
export function multiply(a,b){return normalize([
  a[3]*b[0]+a[0]*b[3]+a[1]*b[2]-a[2]*b[1],
  a[3]*b[1]-a[0]*b[2]+a[1]*b[3]+a[2]*b[0],
  a[3]*b[2]+a[0]*b[1]-a[1]*b[0]+a[2]*b[3],
  a[3]*b[3]-a[0]*b[0]-a[1]*b[1]-a[2]*b[2]
]);}
export function rotate(q,v){
  const tx=2*(q[1]*v[2]-q[2]*v[1]),ty=2*(q[2]*v[0]-q[0]*v[2]),tz=2*(q[0]*v[1]-q[1]*v[0]);
  return [v[0]+q[3]*tx+q[1]*tz-q[2]*ty,v[1]+q[3]*ty+q[2]*tx-q[0]*tz,v[2]+q[3]*tz+q[0]*ty-q[1]*tx];
}
export function axisAngle(axis,angle){const n=Math.hypot(...axis);if(n<1e-12)return identity();const s=Math.sin(angle/2)/n;return [axis[0]*s,axis[1]*s,axis[2]*s,Math.cos(angle/2)];}
export function point(x,y,cx,cy,radius){
  const u=(x-cx)/radius,v=(cy-y)/radius,d=Math.hypot(u,v);
  // Spherical centre, hyperbolic skirt: no discontinuity at the visible sphere edge.
  const z=d*d<=.5?Math.sqrt(1-d*d):.5/d,n=Math.hypot(u,v,z);
  return [u/n,v/n,z/n];
}
export function between(a,b){
  const dot=Math.max(-1,Math.min(1,a[0]*b[0]+a[1]*b[1]+a[2]*b[2]));
  if(dot<-.999999){const basis=Math.abs(a[0])<.8?[1,0,0]:[0,1,0];return axisAngle([a[1]*basis[2]-a[2]*basis[1],a[2]*basis[0]-a[0]*basis[2],a[0]*basis[1]-a[1]*basis[0]],Math.PI);}
  return normalize([a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0],1+dot]);
}
export function velocity(first,last,seconds,maxSpeed=9){
  if(seconds<=.008)return [0,0,0];
  let delta=multiply(last,[-first[0],-first[1],-first[2],first[3]]);
  if(delta[3]<0)delta=delta.map(v=>-v);
  const n=Math.hypot(delta[0],delta[1],delta[2]);if(n<1e-10)return [0,0,0];
  const speed=Math.min(maxSpeed,2*Math.atan2(n,Math.max(0,delta[3]))/seconds);
  return delta.slice(0,3).map(v=>v/n*speed);
}
