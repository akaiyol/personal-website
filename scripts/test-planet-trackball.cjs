const assert=require('assert/strict'),fs=require('fs');
(async()=>{const code=fs.readFileSync(require('path').join(__dirname,'../assets/planet/trackball.js'),'utf8'),b=await import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'));
 const near=(a,c,t=1e-9)=>assert(Math.hypot(...a.map((v,i)=>v-c[i]))<t,JSON.stringify({a,c}));
 const unit=v=>{const n=Math.hypot(...v);return v.map(x=>x/n)};
 for(const [a,c]of [[[0,0,1],[1,0,0]],[[1,0,0],[-1,0,0]],[[0,1,0],[0,-1,0]],[unit([1,2,3]),unit([3,-1,2])]])near(b.rotate(b.between(a,c),a),c);
 // A point on the grabbed surface follows the pointer, including the hyperbolic skirt.
 for(const [x,y]of [[0,0],[40,60],[-100,80],[400,500],[-800,-900]]){const a=b.point(10,20,0,0,200),c=b.point(x,y,0,0,200);near(b.rotate(b.between(a,c),a),c);}
 // Equivalent diagonal gestures vary continuously through the old 45-degree boundary.
 const start=b.point(-80,-40,0,0,300),a=b.point(40,78,0,0,300),c=b.point(38,80,0,0,300),qa=b.between(start,a),qc=b.between(start,c),va=b.velocity(b.identity(),qa,.08),vc=b.velocity(b.identity(),qc,.08);
 assert(va.reduce((s,v,i)=>s+v*vc[i],0)/(Math.hypot(...va)*Math.hypot(...vc))>.999);
 // Momentum uses the release quaternion's rotation axis and speed.
 const q0=b.axisAngle([1,2,3],.4),delta=b.axisAngle([2,-1,1],.18),q1=b.multiply(delta,q0),w=b.velocity(q0,q1,.06);near(b.rotate(b.axisAngle(w,Math.hypot(...w)*.06),b.rotate(q0,[0,0,1])),b.rotate(q1,[0,0,1]));
 let q=b.identity();for(let i=0;i<10000;i++)q=b.multiply(b.axisAngle([1,2,-3],.03),q);assert(Math.abs(Math.hypot(...q)-1)<1e-12);assert(Math.abs(Math.hypot(...b.rotate(q,[2,3,4]))-Math.sqrt(29))<1e-9);
 assert(Math.hypot(...b.velocity(b.identity(),b.axisAngle([1,0,0],2),.01))<=9.000001);near(b.velocity(q0,q1,0),[0,0,0]);console.log('Trackball geometry, continuity, release-axis and long-run normalization checks passed');
})();
