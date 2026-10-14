const assert=require('assert'),path=require('path');
async function checkHomePlanet(page,base,out){
 await page.goto(base+'/?planet-intro-check#home');const planet=page.locator('#home-planet');
 await page.waitForFunction(()=>document.querySelector('#home-planet').dataset.frame);
 if(!await page.evaluate(()=>matchMedia('(prefers-reduced-motion: reduce)').matches)){
  assert.equal(await planet.getAttribute('data-intro'),'running','First home load should introduce the planet');
  const before=await page.locator('.hero').boundingBox();
  await page.screenshot({path:path.join(out,'planet-intro-start.png')});
  await page.waitForFunction(()=>document.querySelector('#home-planet').dataset.intro==='complete',null,{timeout:3000});
  assert.equal(Number((await planet.getAttribute('data-rotation')).split(',')[2]),.32,'Intro must land at original pose');
  assert.deepEqual(await page.locator('.hero').boundingBox(),before,'Intro moved home content');
 }

 assert.equal(await page.locator('.terminal-runner,[data-snoopy-avatar]').count(),0,'Home Snoopy should be removed');
 for(const width of [1280,390,320]){
  await page.setViewportSize({width,height:900});await page.waitForTimeout(150);
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Planet creates overflow');
  const layer=await page.locator('.hero .cta').first().evaluate(el=>({foreground:Number(getComputedStyle(el.closest('.hero')).zIndex),planet:Number(getComputedStyle(document.querySelector('#home-planet')).zIndex),rim:getComputedStyle(el).boxShadow}));
  assert(layer.foreground>layer.planet&&layer.rim!=='none','Buttons must be above artwork with black rim');
  await page.screenshot({path:path.join(out,`planet-${width}.png`)});
 }
 await page.setViewportSize({width:1280,height:900});
 const hint=page.locator('#planet-drag-hint'), hoverBox=await planet.boundingBox();
 const hoverX=hoverBox.x+hoverBox.width*.89,hoverY=hoverBox.y+hoverBox.height*.58;
 const heroBounds=await page.locator('.hero').boundingBox();
 await page.mouse.move(hoverX,hoverY);await hint.waitFor({state:'visible'});await page.waitForTimeout(350);
 assert.notEqual(await planet.getAttribute('data-hover'),'0.00000,0.00000','Hover did not tilt planet');
 assert.deepEqual(await page.locator('.hero').boundingBox(),heroBounds,'Hover moved home content');
 await page.screenshot({path:path.join(out,'planet-hover-hint.png')});
 await page.mouse.move(1,1);await hint.waitFor({state:'hidden'});
 await page.mouse.move(hoverX,hoverY);await hint.waitFor({state:'visible'});
 await page.mouse.click(hoverX,hoverY);assert(await hint.isVisible(),'Click alone should not dismiss drag hint');
 await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(100);
 const rotation=await planet.getAttribute('data-rotation'),box=await planet.boundingBox();
 await page.mouse.move(box.x+box.width*.83,box.y+box.height*.3);await page.mouse.down();await page.mouse.move(box.x+box.width*.83+60,box.y+box.height*.3+30,{steps:8});await page.mouse.up();
 assert.notEqual(await planet.getAttribute('data-rotation'),rotation,'Drag did not rotate planet');
 assert(await hint.isHidden(),'Drag did not dismiss hint');
 await page.mouse.move(1,1);await page.mouse.move(hoverX,hoverY);assert(await hint.isHidden(),'Hint returned after drag');
 await planet.focus();const keyBefore=await planet.getAttribute('data-rotation');await page.keyboard.press('ArrowLeft');assert.notEqual(await planet.getAttribute('data-rotation'),keyBefore,'Arrow key did not rotate');
 const still=await planet.getAttribute('data-phase');await page.waitForTimeout(250);assert.equal(await planet.getAttribute('data-phase'),still,'Reduced motion still spins');
 await page.emulateMedia({reducedMotion:'no-preference'});await page.waitForTimeout(200);const moving=await planet.getAttribute('data-phase');await page.waitForTimeout(250);assert.notEqual(await planet.getAttribute('data-phase'),moving,'Planet spin did not advance');
 await page.locator('[data-command="about"]').click();await page.locator('#about-view').waitFor({state:'visible'});const stopped=await planet.getAttribute('data-frame');await page.waitForTimeout(250);assert.equal(await planet.getAttribute('data-frame'),stopped,'Hidden route kept rendering planet');
 await page.locator('.identity').click();await planet.waitFor({state:'visible'});assert.equal(await planet.getAttribute('data-intro'),'complete','Intro replayed on route return');await page.waitForTimeout(150);assert.notEqual(await planet.getAttribute('data-frame'),stopped,'Planet did not resume');
 await page.locator('[data-command="work"]').click();await page.locator('#work-view').waitFor({state:'visible'});await page.locator('.identity').click();
}
module.exports={checkHomePlanet};
