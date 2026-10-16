const assert=require('assert'),path=require('path');
async function checkFlowerIntro(page,base,out){
 await page.emulateMedia({reducedMotion:'no-preference'});await page.setViewportSize({width:1470,height:864});
 await page.goto(base+'/?flower-entrance#work');
 const field=page.locator('#flower-field'),art=page.locator('#flower-art'),hint=page.locator('.flower-growth-hint');
 assert(await hint.isHidden(),'Hint appeared before growth');
 await field.scrollIntoViewIfNeeded();await page.waitForFunction(()=>document.querySelector('#flower-art').dataset.intro==='running');
 await page.waitForFunction(()=>Number(document.querySelector('#flower-art').dataset.progress)>.05);
 await page.screenshot({path:path.join(out,'flowers-entrance-growing.png')});
 await page.mouse.move(10,150);await page.mouse.wheel(0,-5000);await page.waitForTimeout(300);
 const paused=await art.getAttribute('data-progress');await page.waitForTimeout(250);assert.equal(await art.getAttribute('data-progress'),paused,'Offscreen growth did not pause');
 await field.scrollIntoViewIfNeeded();await page.waitForFunction(()=>document.querySelector('#flower-art').dataset.intro==='complete',null,{timeout:5000});
 assert.equal(await art.getAttribute('data-progress'),'1.000000');assert(await hint.isVisible(),'Hint missing after full growth');assert((await hint.textContent()).includes('drag'));
 const rulers=JSON.parse(await art.getAttribute('data-rulers'));assert.equal(rulers.length,11);
 assert(new Set(rulers.map(r=>r.value)).size>5,'Different stem heights have identical end values');
 for(const r of rulers){assert(Math.abs(r.value-r.length/300)<.006,'Stem value does not use shared scale');assert(Math.abs(r.tip.y+r.length)<.002,'Ruler endpoint does not reach bud');}
 await page.screenshot({path:path.join(out,'flowers-full-rulers-desktop.png')});
 for(let i=1;i<=5;i++){await page.waitForTimeout(1800);await page.screenshot({path:path.join(out,`flowers-wind-${i}.png`)});}
 await page.mouse.move(10,150);await page.mouse.wheel(0,12);await page.waitForTimeout(100);assert((await hint.textContent()).includes('swipe'),'Trackpad-style input did not update hint');
 const box=await field.boundingBox();const y=Math.min(box.y+box.height*.5,page.viewportSize().height-130);
 await page.mouse.move(box.x+box.width*.55,y);await page.mouse.down();await page.mouse.move(box.x+box.width*.35,y,{steps:12});await page.mouse.up();
 await page.waitForFunction(()=>Number(document.querySelector('#flower-art').dataset.progress)<1);assert(await hint.isHidden(),'Drag did not dismiss hint');
 await field.focus();await page.keyboard.press('Home');await page.waitForFunction(()=>document.querySelector('#flower-art').dataset.progress==='0.000000');assert(await hint.isHidden());
 await page.waitForTimeout(200);assert.equal(await art.getAttribute('data-progress'),'0.000000','Intro restarted after interaction');
 await page.keyboard.press('End');
 for(const width of [390,320]){await page.setViewportSize({width,height:844});await field.scrollIntoViewIfNeeded();await page.waitForTimeout(150);assert.equal(JSON.parse(await art.getAttribute('data-rulers')).length,6);await page.screenshot({path:path.join(out,`flowers-full-rulers-${width}.png`)});}
 const touch=await page.context().browser().newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,reducedMotion:'reduce'});
 try{const mobile=await touch.newPage();await mobile.goto(base+'/?flower-touch#work');await mobile.locator('#flower-field').scrollIntoViewIfNeeded();await mobile.waitForFunction(()=>document.querySelector('#flower-art').dataset.intro==='complete');assert.equal(await mobile.locator('#flower-art').getAttribute('data-progress'),'1.000000');assert((await mobile.locator('.flower-growth-hint').textContent()).includes('swipe'));await mobile.screenshot({path:path.join(out,'flowers-touch-reduced-motion.png')});}finally{await touch.close();}
 await page.emulateMedia({reducedMotion:'no-preference'});await page.setViewportSize({width:1280,height:900});await page.goto(base);
}
module.exports={checkFlowerIntro};
