const assert=require('assert'),path=require('path');
async function drivePlanetFlick(page,base,out){
 const planet=page.locator('#home-planet');
 const samples=[];
 await page.goto(base+'/?flick-check#home');await planet.waitFor({state:'visible'});
 await page.waitForFunction(()=>document.querySelector('#home-planet').dataset.intro==='complete');
 await page.evaluate(()=>{window.__planetFrames=[];const c=document.querySelector('#home-planet');new MutationObserver(()=>window.__planetFrames.push({time:performance.now(),phase:+c.dataset.phase,spin:+c.dataset.spin})).observe(c,{attributes:true,attributeFilter:['data-frame']});});
 await page.evaluate(()=>{window.__gestureEvents=[];for(const type of ['pointerdown','pointermove','pointerup','pointercancel'])document.addEventListener(type,e=>window.__gestureEvents.push({type:e.type,x:e.clientX,y:e.clientY,t:e.timeStamp,target:e.target.id}));});
 const foreground=()=>page.locator('.hero h1').boundingBox(),baseline=await foreground(),initialOrientation=(await planet.getAttribute('data-orientation')).split(',').map(Number);
 const mouse=await page.context().newCDPSession(page);
 const orientation=async()=> (await planet.getAttribute('data-orientation')).split(',').map(Number);
 const omega=async()=> (await planet.getAttribute('data-angular-velocity')).split(',').map(Number);
 const distance=(a,b)=>2*Math.acos(Math.min(1,Math.abs(a.reduce((n,v,i)=>n+v*b[i],0))));
 const cosine=(a,b)=>a.reduce((n,v,i)=>n+v*b[i],0)/Math.hypot(...a)/Math.hypot(...b);
 // Replay native input with explicit physical sampling times. Browser/trace/video
 // processing latency must not redefine a fast gesture as a slow one.
 async function gesture(dx,dy=0,hold=0,stepDelay=10){
  const b=await planet.boundingBox(),x=b.x+b.width*.78,y=b.y+b.height*.35,start=Date.now()/1000;
  await mouse.send('Input.dispatchMouseEvent',{type:'mouseMoved',x,y,timestamp:start});
  await mouse.send('Input.dispatchMouseEvent',{type:'mousePressed',x,y,button:'left',buttons:1,clickCount:1,timestamp:start});
  for(let i=1;i<=7;i++)await mouse.send('Input.dispatchMouseEvent',{type:'mouseMoved',x:x+dx*i/7,y:y+dy*i/7,button:'left',buttons:1,timestamp:start+i*stepDelay/1000});
  if(hold)await page.waitForTimeout(hold);
  await mouse.send('Input.dispatchMouseEvent',{type:'mouseReleased',x:x+dx,y:y+dy,button:'left',buttons:0,clickCount:1,timestamp:start+(8*stepDelay+hold)/1000});
  const remainder=(start+(8*stepDelay+hold)/1000-Date.now()/1000)*1000;if(remainder>0)await page.waitForTimeout(remainder);
  await page.mouse.move(1,1);await page.waitForTimeout(40);
  const q=await orientation();assert(Math.abs(Math.hypot(...q)-1)<.000001,'Orientation lost normalization');
 }
 await gesture(160);let speed=Number(await planet.getAttribute('data-spin'));require('fs').writeFileSync(path.join(out,'flick-input.json'),JSON.stringify(await page.evaluate(()=>({reduce:matchMedia('(prefers-reduced-motion: reduce)').matches,events:window.__gestureEvents})),null,2));assert(speed>2,'Flick did not launch fast rotation: '+speed);
 await page.screenshot({path:path.join(out,'planet-flick-launch.png')});
 // DOM dataset uses camelCase; read it directly to avoid HTML attribute casing ambiguity.
 const skyBefore=await planet.evaluate(el=>+el.dataset.skyPhase),poseBefore=await orientation();
 await page.waitForTimeout(220);
 const skyAfter=await planet.evaluate(el=>+el.dataset.skyPhase),poseAfter=await orientation();
 const advance=(a,b)=>(b-a+Math.PI*2)%(Math.PI*2);
 assert(advance(skyBefore,skyAfter)<.08,'Background stars accelerated with the planet');assert(distance(poseBefore,poseAfter)>.2,'Planet did not accelerate independently');assert(distance(initialOrientation,poseAfter)>.2,'Drag failed to change orientation');
 let previous=speed;
 for(const delay of [200,400,800,1600,3200,6400,3000]){await page.waitForTimeout(delay);const spin=Number(await planet.getAttribute('data-spin'));assert(spin>=0&&spin<=previous+.001,'Coast speed increased or reversed');previous=spin;samples.push({elapsed:delay,spin,phase:await planet.getAttribute('data-phase')});await page.screenshot({path:path.join(out,'planet-coast-'+samples.length+'.png')});}
 assert.equal(previous,0,'Flick did not settle completely');
 const phase=await planet.getAttribute('data-phase');await page.waitForTimeout(200);assert.notEqual(await planet.getAttribute('data-phase'),phase,'Idle did not continue');
 assert.deepStrictEqual(await foreground(),baseline,'Momentum moved content');
 await gesture(30,0,0,70);assert.equal(Number(await planet.getAttribute('data-spin')),0,'Slow drag launched momentum');
 await gesture(160);const forward=await omega();await gesture(-160);assert(Number(await planet.getAttribute('data-spin'))>2,'Reverse flick missing');assert(cosine(forward,await omega())<-.95,'Reverse flick direction incorrect');
 await gesture(160,0,180);assert.equal(Number(await planet.getAttribute('data-spin')),0,'Held release should not fling');const heldPose=await orientation();await page.waitForTimeout(240);assert(distance(heldPose,await orientation())<.001,'Held release reset the chosen orientation');
 await gesture(120,118);const diagonalA=await omega();await gesture(118,120);assert(cosine(diagonalA,await omega())>.99,'Nearby diagonals switched rotation direction');
 await gesture(140,0);const horizontal=await omega();await gesture(0,140);assert(Math.abs(cosine(horizontal,await omega()))<.6,'Drag directions collapsed onto a fixed axis');
 const releasedPose=await orientation(),releasedOmega=await omega();await page.waitForTimeout(90);const continuedPose=await orientation();
 const source=require('fs').readFileSync(path.join(__dirname,'../assets/planet/trackball.js'),'utf8'),ball=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
 const actual=ball.velocity(releasedPose,continuedPose,.09);assert(cosine(releasedOmega,actual)>.999,'Coast switched axis after release');
 for(const [dx,dy]of [[120,-70],[-120,70],[100,100],[-100,-100],[-150,0],[-150,0],[-150,0],[-150,0]])await gesture(dx,dy);
 await page.screenshot({path:path.join(out,'planet-repeated-diagonal-flicks.png')});
 await gesture(0,-120);assert(Number(await planet.getAttribute('data-spin'))>2,'Vertical flick should launch');
 await planet.focus();await page.keyboard.press('ArrowLeft');assert.equal(Number(await planet.getAttribute('data-spin')),0,'Ordinary arrow did not catch spin');
 await page.keyboard.press('Shift+ArrowRight');assert(Number(await planet.getAttribute('data-spin'))>0,'Keyboard fast spin missing');
 await page.locator('[data-command="about"]').click();await page.locator('#about-view').waitFor({state:'visible'});await page.locator('.identity').click();await planet.waitFor({state:'visible'});await page.waitForFunction(()=>document.querySelector('#home-planet').dataset.spin==='0.0000');assert.equal(Number(await planet.getAttribute('data-spin')),0,'Hidden route retained fling');
 await page.emulateMedia({reducedMotion:'reduce'});await gesture(160);assert.equal(Number(await planet.getAttribute('data-spin')),0);const still=await planet.getAttribute('data-phase');await page.waitForTimeout(200);assert.equal(await planet.getAttribute('data-phase'),still);await planet.focus();await page.keyboard.press('Shift+ArrowRight');assert.equal(Number(await planet.getAttribute('data-spin')),0,'Reduced motion launched keyboard inertia');await mouse.detach();
 const frames=await page.evaluate(()=>window.__planetFrames);const intervals=frames.slice(1).map((f,i)=>f.time-frames[i].time).filter(n=>n>0&&n<500).sort((a,b)=>a-b);
 require('fs').writeFileSync(path.join(out,'planet-flick-motion.json'),JSON.stringify({samples,frames,diagnostics:{medianMs:intervals[Math.floor(intervals.length*.5)],p95Ms:intervals[Math.floor(intervals.length*.95)]}},null,2));
 // Keep the completed desktop drive static while measuring the independent touch gesture.
 // Real touch input through Chromium; no synthetic PointerEvent dispatch.
 const context=await page.context().browser().newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,reducedMotion:'no-preference'});
 try{const touch=await context.newPage();await touch.goto(base+'/#home');await touch.waitForFunction(()=>document.querySelector('#home-planet').dataset.intro==='complete');const c=touch.locator('#home-planet'),b=await c.boundingBox(),cdp=await context.newCDPSession(touch);const x=b.x+b.width*.82,y=b.y+b.height*.6,start=Date.now()/1000;
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}],timestamp:start});
  for(let i=1;i<=7;i++){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x-160*i/7,y}],timestamp:start+i*.016});}
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[],timestamp:start+.128});await touch.waitForTimeout(160);assert(Number(await c.getAttribute('data-spin'))>2,'Touch flick did not launch: '+await c.getAttribute('data-spin'));assert.equal(await touch.evaluate(()=>scrollY),0);await touch.screenshot({path:path.join(out,'planet-touch-flick.png')});
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});await touch.waitForTimeout(80);assert.equal(Number(await c.getAttribute('data-spin')),0,'Cancelled touch launched momentum');await cdp.detach();
  await touch.goto(base+'/?interrupt-entrance#home');await touch.waitForFunction(()=>document.querySelector('#home-planet').dataset.frame);const early=touch.locator('#home-planet');
  const before=(await early.getAttribute('data-rotation')).split(',').map(Number);await early.focus();await touch.keyboard.press('Shift+ArrowRight');await touch.waitForFunction(()=>+document.querySelector('#home-planet').dataset.spin>0);
  assert.equal(await early.getAttribute('data-intro'),'interrupted');const after=(await early.getAttribute('data-rotation')).split(',').map(Number);assert(Math.abs(after[1]-before[1])<.2,'Interrupted entrance reset its pitch');assert(Math.abs(after[1]-.4)>.2,'Interrupted entrance forced the rest pose');
 }finally{await context.close();}
}
// The parent recipe's trace captures a DOM screenshot for every pointer action.
// That instrumentation stretches a quick gesture into a slow drag. Drive timing-sensitive
// input in an owned, untraced context, retaining continuous video and frame observations.
async function checkPlanetFlick(page,base,out){
 await page.locator('[data-command="about"]').click();await page.locator('#about-view').waitFor({state:'visible'});
 const context=await page.context().browser().newContext({viewport:{width:1280,height:800},reducedMotion:'no-preference',recordVideo:{dir:path.join(out,'flick-video'),size:{width:1280,height:800}}});
 const errors=[];
 try{const live=await context.newPage();live.on('pageerror',e=>errors.push(e.message));await drivePlanetFlick(live,base,out);assert.deepStrictEqual(errors,[]);}finally{await context.close();await page.locator('.identity').click();}
}
module.exports={checkPlanetFlick};
