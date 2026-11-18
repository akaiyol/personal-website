(() => {
  'use strict';
  const ink='#c5b5ec',TAU=Math.PI*2,clamp=x=>Math.max(0,Math.min(1,x));
  const smooth=x=>{x=clamp(x);return x*x*(3-2*x)};
  // Authored ribbon centerlines establish the reference silhouette. Every petal
  // remains a generated curved surface rooted on the same numeric cup.
  const petalProfiles = [
    {a:[-17,0,-10],b:[-28,17,-15],c:[-49,33,-18],d:[-57,34,-16],w:3.5},
    {a:[-12,0,-17],b:[-16,22,-22],c:[-34,46,-25],d:[-29,46,-22],w:5.5},
    {a:[-5,0,-22],b:[-10,25,-26],c:[-10,51,-25],d:[-3,49,-22],w:7},
    {a:[4,0,-22],b:[8,23,-25],c:[23,48,-24],d:[27,45,-20],w:6},
    {a:[13,0,-17],b:[23,20,-21],c:[48,38,-20],d:[51,33,-16],w:3.2},
    {a:[20,0,-8],b:[36,14,-10],c:[65,23,-10],d:[74,18,-5],w:4.2},
    {a:[-22,0,-3],b:[-41,12,-2],c:[-71,11,2],d:[-83,-9,6],w:6.3},
    {a:[22,0,-2],b:[43,13,2],c:[71,9,7],d:[83,-11,10],w:7.1},
    {a:[-17,0,15],b:[-32,6,20],c:[-57,1,24],d:[-65,-14,25],w:7},
    {a:[-6,0,22],b:[-18,7,30],c:[-28,9,42],d:[-34,2,48],w:11},
    {a:[13,0,19],b:[26,10,26],c:[47,11,35],d:[56,0,39],w:7.5}
  ];
  function render(p,g,params) {
    const rand=(a,b=0)=>{let x=Math.imul((a+params.seed*101)|0,1597334677)^Math.imul(b|0,3812015801);x=Math.imul(x^(x>>>16),2246822507);return ((x^(x>>>13))>>>0)/4294967296};
    const sprite=typeof document==='undefined'?new OffscreenCanvas(520,600):document.createElement('canvas');sprite.width=520;sprite.height=600;sprite.anchor=[0,0];
    const c=sprite.getContext('2d');c.translate(260,350);c.scale(2,2);
    const yaw=params.yaw*Math.PI/180+p.angle, elevation=p.elevation+params.pitch*Math.PI/180;
    const tilt=p.variant===1?-.25:p.variant===2?.10:-.06;
    const cy=Math.cos(yaw),sy=Math.sin(yaw),ce=Math.cos(elevation),se=Math.sin(elevation),ct=Math.cos(tilt),st=Math.sin(tilt);
    const project=([x,y,z])=>{
      const X=x*cy-z*sy,Z=x*sy+z*cy,Y=-y*ce+Z*se;
      return [X*ct-Y*st,X*st+Y*ct,Z*ce+y*se];
    };
    const open=smooth((g-.53)/.47), bowl=smooth((g-.4)/.32), radius=24*bowl, depth=params.centerDepth*122*bowl*(p.variant===2?.8:1);
    if(!bowl)return sprite;
    sprite.anchor=project([0,-depth,0]);
    // Compile each cubic once instead of allocating three arrays per dot.
    const coefficients=profile=>profile.a.map((a,k)=>[a,3*(profile.b[k]-a),3*(a-2*profile.b[k]+profile.c[k]),-a+3*profile.b[k]-3*profile.c[k]+profile.d[k]]);
    const evaluate=(c,t)=>((c[3]*t+c[2])*t+c[1])*t+c[0];
    const petals=[];
    for(let j=0;j<params.petalCount;j++){
      const profile=petalProfiles[j%petalProfiles.length];
      const extra=j>=petalProfiles.length?(j-petalProfiles.length+1)*.15:0;
      const variation=.94+rand(p.id*43+j,12)*.12,coeff=coefficients(profile);
      const center=t=>{
        const reach=params.petalLength*variation;
        let x=profile.a[0]+(evaluate(coeff[0],t)-profile.a[0])*reach;
        let y=evaluate(coeff[1],t)*reach*(p.variant===2?.48:p.variant===0?.62:1.12),z=evaluate(coeff[2],t);
        const opening=open*params.openness/.83;
        x=profile.a[0]*(1-t*.7)+(x-profile.a[0]*(1-t*.7))*opening;
        y=(1-opening)*t*55*reach+opening*y;
        y+=params.petalCurl*9*Math.sin(Math.PI*t)-params.petalCurl*8*t*t;
        if(p.variant===1)x-=y*.12;
        z=z*bowl+extra*x;
        return [x*bowl,y*bowl,z];
      };
      const point=(t,v)=>{
        const q=center(t),before=center(Math.max(0,t-.002)),after=center(Math.min(1,t+.002));
        const dx=after[0]-before[0],dy=after[1]-before[1],len=Math.hypot(dx,dy)||1;
        const w=profile.w*Math.sin(Math.PI*t)**.65*(.15+.85*open)*v;
        return [q[0]-dy/len*w,q[1]+dx/len*w+Math.abs(v)**1.8*Math.sin(Math.PI*t)*profile.w*.16,q[2]+w*.18];
      };
      const boundary=[];for(let k=0;k<=44;k++)boundary.push(project(point(k/44,-1)));
      for(let k=44;k>=0;k--)boundary.push(project(point(k/44,1)));
      petals.push({j,point,boundary,z:project(center(.5))[2]});
    }
    const paintPetal=petal=>{
      const path=new Path2D();petal.boundary.forEach((q,i)=>i?path.lineTo(q[0],q[1]):path.moveTo(q[0],q[1]));path.closePath();
      c.fillStyle='#000';c.fill(path);c.save();c.clip(path);c.fillStyle=ink;
      // Sample along the ribbon without painting individual opaque mesh tiles.
      // Its continuous silhouette is more important than random fold noise.
      const samples=2300;
      for(let k=0;k<samples;k++){
        const seed=p.id*700001+petal.j*5003+k;
        const t=rand(seed,41),v=rand(seed,42)*2-1;
        if(rand(seed,43)>(v<0?.82:.98))continue;
        const q=project(petal.point(t,v));c.globalAlpha=.78+rand(seed,44)*.22;
        c.fillRect(q[0],q[1],.48+rand(seed,45)*.22,.58);
      }
      c.restore();c.globalAlpha=1;
    };
    petals.sort((a,b)=>a.z-b.z);
    petals.filter(q=>q.z<9).forEach(paintPetal);
    const cupPoint=(u,a)=>{const r=radius*(.08+.92*u**.85);return project([r*Math.cos(a),-depth*(1-u),r*Math.sin(a)])};
    const cup=new Path2D();
    for(let k=0;k<=30;k++){const q=cupPoint(1,k*TAU/30);k?cup.lineTo(q[0],q[1]):cup.moveTo(q[0],q[1])}
    for(let k=30;k>=0;k--){const q=cupPoint(0,k*TAU/30);cup.lineTo(q[0],q[1])}cup.closePath();c.fillStyle='#000';c.fill(cup);
    // Individual glyphs follow the visible half of the bowl; each row encodes u.
    c.fillStyle=ink;c.textAlign='center';c.textBaseline='middle';
    for(let row=0;row<7;row++){
      const u=.12+row*.13, count=Math.max(3,Math.round(14*(.1+.9*u)));
      const digits=(u.toFixed(2).slice(1)).repeat(4).slice(0,count);
      for(let k=0;k<digits.length;k++){
        const a=.12+(Math.PI-.24)*k/(digits.length-1),q=cupPoint(u,a);
        c.save();c.translate(q[0],q[1]);c.scale(.45+.55*Math.sin(a),1);c.font=`${5.5+u*2.5}px Menlo,monospace`;c.fillText(digits[k],0,0);c.restore();
      }
    }
    petals.filter(q=>q.z>=9).forEach(paintPetal);
    return sprite;
  }
  self.FlowerBloom={render};
})();
