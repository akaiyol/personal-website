const assert=require('assert'),path=require('path');
async function checkPhoneHomeScroll(page,base,out){
 const browser=page.context().browser();
 for(const [width,height] of [[320,740],[390,844],[430,932],[844,390]]){
  const ctx=await browser.newContext({viewport:{width,height},hasTouch:true,isMobile:true,reducedMotion:'reduce'});
  try{
   const p=await ctx.newPage();await p.goto(base+'/#home');await p.waitForLoadState('networkidle');
   const canvas=p.locator('#home-planet');await p.waitForFunction(()=>document.querySelector('#home-planet').dataset.rotation);
   const cdp=await ctx.newCDPSession(p);
   async function swipe(x,y,dx,dy){
    await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});
    for(let i=1;i<=8;i++){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x+dx*i/8,y:y+dy*i/8}]});await p.waitForTimeout(20);}
    await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await p.waitForTimeout(100);
   }
   const box=await canvas.boundingBox();const x=box.x+box.width*.88,y=box.y+box.height*.52;
   for(const dy of [-70,70]){
    const angle=await canvas.getAttribute('data-rotation');await swipe(x,y,0,dy);assert.notEqual(await canvas.getAttribute('data-rotation'),angle,'Vertical touch must rotate the planet');
    assert.equal(await p.evaluate(()=>scrollY),0,'Home moved during touch');
   }
   await p.mouse.move(x,y);await p.mouse.wheel(0,600);await p.mouse.wheel(0,-600);await p.evaluate(()=>scrollTo(0,500));assert.equal(await p.evaluate(()=>scrollY),0,'Home allows document scrolling');
   assert(await p.evaluate(()=>document.documentElement.scrollHeight<=innerHeight+1),'Home document exceeds viewport');
   assert(await canvas.evaluate(e=>getComputedStyle(e).touchAction==='none'));
   const footer=await p.locator('.terminal>footer').boundingBox(),shell=await p.locator('.terminal').boundingBox();assert(Math.abs(shell.y+shell.height-footer.y-footer.height)<2,'Home shell and footer are separated');
   await p.screenshot({path:path.join(out,`home-no-scroll-${width}.png`)});
   // Simulate the dynamic browser viewport changing height without changing orientation.
   if(width<700){await p.setViewportSize({width,height:height-90});await p.waitForTimeout(100);assert(await p.evaluate(()=>document.documentElement.scrollHeight<=innerHeight+1));await p.setViewportSize({width,height});}
   await p.locator('.phone-nav a[href="#about"]').tap();await p.locator('#about-view').waitFor({state:'visible'});assert(!(await p.locator('html').evaluate(e=>e.classList.contains('phone-home'))));
   await swipe(width*.85,height*.64,0,-130);assert(await p.evaluate(()=>scrollY)>30,'About no longer scrolls');
   await p.locator('.phone-nav a[href="#work"]').tap();await p.locator('#work-view').waitFor({state:'visible'});await swipe(width*.85,height*.64,0,-130);assert(await p.evaluate(()=>scrollY)>30,'Work no longer scrolls');
   await p.locator('.phone-nav a[href="#home"]').tap();await p.locator('.hero').waitFor({state:'visible'});assert.equal(await p.evaluate(()=>scrollY),0);assert(await p.locator('html').evaluate(e=>e.classList.contains('phone-home')));
   await p.setViewportSize({width:1280,height:900});await p.waitForTimeout(100);assert(!(await p.locator('html').evaluate(e=>e.classList.contains('phone-home'))),'Phone lock survives desktop resize');
   await cdp.detach();
  }finally{await ctx.close();}
 }
}
module.exports={checkPhoneHomeScroll};
