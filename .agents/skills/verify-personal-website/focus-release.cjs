const assert=require('assert'),fs=require('fs'),path=require('path');
async function checkFocusRelease(page,base,out){
 const coverage=[];
 async function released(control,name){
  await page.waitForTimeout(40);
  assert(await control.evaluate(el=>document.activeElement!==el),name+' retained focus');
 }
 async function activate(control,mode,name){
  console.log('focus: '+mode+' '+name);await control.scrollIntoViewIfNeeded();
  if(mode==='mouse'){
   const position=await control.evaluate(el=>{const r=el.getBoundingClientRect();for(let y=2;y<r.height;y+=3)for(let x=2;x<r.width;x+=3){const px=r.x+x,py=r.y+y;if(px<0||px>=innerWidth||py<0||py>=innerHeight)continue;const hit=document.elementFromPoint(px,py);if(hit&&el.contains(hit))return {x:px,y:py};}return null;});
   assert(position,'No exposed pointer target for '+name);await page.mouse.click(position.x,position.y);
  }
  else{await control.focus();assert(await control.evaluate(el=>document.activeElement===el),'Control was not focusable: '+name);await page.keyboard.press(mode);}
  await released(control,name+' / '+mode);coverage.push({name,mode});
 }
 await page.emulateMedia({reducedMotion:'reduce'});
 for(const mode of ['mouse','Enter','Space']){console.log('focus: checking '+mode);
  for(const destination of ['about','work']){
   await page.goto(base+'/#home');await activate(page.locator('[data-command="'+destination+'"]'),mode,'Home '+destination);await page.locator('#'+destination+'-view').waitFor({state:'visible'});
  }
  await page.goto(base+'/#home');await page.locator('#command').fill('about');await activate(page.locator('.go-button'),mode,'Terminal Go');await page.locator('#about-view').waitFor({state:'visible'});
  await activate(page.locator('[data-copy-email]'),mode,'Copy email');await page.getByText('Copied',{exact:true}).waitFor();await released(page.locator('[data-copy-email]'),'Copy email after async completion');
  await page.waitForFunction(()=>!document.querySelector('.fact-roll').disabled);await activate(page.locator('.fact-roll'),mode,'Roll facts');await page.waitForFunction(()=>!document.querySelector('.fact-roll').disabled);await released(page.locator('.fact-roll'),'Roll completion');
  const triggers=[page.locator('button.portrait-wink-trigger'),...await page.locator('#about-view .memories .memory').all(),...await page.locator('button.fact-photo-tag').all()];
  for(let i=0;i<triggers.length;i++){
   await activate(triggers[i],mode,'Photo '+i);await page.locator('dialog.photo-zoom').waitFor({state:'visible'});
   // Opening keeps focus inside the dialog; closing must release its restored trigger.
   assert(await page.evaluate(()=>document.querySelector('dialog[open]').contains(document.activeElement)),'Dialog lost its focus');
   await activate(page.locator('.photo-zoom-close'),mode,'Close photo '+i);await page.locator('dialog.photo-zoom').waitFor({state:'hidden'});await released(triggers[i],'Restored photo '+i);
  }
  await page.goto(base+'/#work');
  if(await page.locator('.stats-toggle').getAttribute('aria-expanded')==='true')await page.locator('.stats-toggle').click();
  await activate(page.locator('.stats-toggle'),mode,'Stats show');assert.equal(await page.locator('.stats-toggle').getAttribute('aria-expanded'),'true');
  await activate(page.locator('.stats-toggle'),mode,'Stats hide');assert.equal(await page.locator('.stats-toggle').getAttribute('aria-expanded'),'false');
  for(const filter of await page.locator('.work-filters button').all()){
   await activate(filter,mode,'Filter '+await filter.textContent());assert.equal(await filter.getAttribute('aria-pressed'),'true');
  }
  await page.locator('.work-filters button').filter({hasText:/^All$/}).click();
  const roleTags=await page.locator('.timeline .entry button[data-work-type]').all();
  for(let i=0;i<roleTags.length;i++){
   await page.locator('.work-filters button').filter({hasText:/^All$/}).click();await activate(roleTags[i],mode,'Role tag '+i);assert.equal(await roleTags[i].getAttribute('aria-pressed'),'true');
  }
  await page.locator('.work-filters button').filter({hasText:/^All$/}).click();await page.locator('.stats-toggle').click();await page.locator('.years a[href="#work/2023"]').click();
  const graph=page.locator('.strengths-graph');await page.waitForFunction(()=>document.querySelector('.strengths-graph').getAttribute('role')==='button');await activate(graph,mode,'Stats comparison');
  await page.screenshot({path:path.join(out,'focus-work-'+mode+'.png')});
 }
 // Keyboard focus remains visible before activation; page shortcuts work afterwards.
 await page.goto(base+'/#home');await page.locator('[data-command="about"]').focus();assert((await page.locator('[data-command="about"]').evaluate(el=>document.activeElement===el)));await page.keyboard.press('Enter');await page.locator('#about-view').waitFor({state:'visible'});await page.keyboard.press('1');await page.waitForFunction(()=>!document.querySelector('.fact-roll').disabled);await page.locator('.identity').click();await page.locator('.hero').waitFor({state:'visible'});await page.keyboard.press('2');await page.locator('#work-view').waitFor({state:'visible'});
 await page.setViewportSize({width:390,height:844});await activate(page.locator('.stats-toggle'),'mouse','Narrow stats');await page.screenshot({path:path.join(out,'focus-work-390.png')});await page.setViewportSize({width:1280,height:900});
 fs.writeFileSync(path.join(out,'focus-coverage.json'),JSON.stringify(coverage,null,2));
 await page.emulateMedia({reducedMotion:'no-preference'});await page.goto(base+'/#home');
}
module.exports={checkFocusRelease};
