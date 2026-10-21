const assert=require('assert'),path=require('path');
async function checkPhone(page,base,out){
 const browser=page.context().browser();
 for(const [width,height] of [[320,740],[390,844],[430,932],[844,390]]){
  const ctx=await browser.newContext({viewport:{width,height},hasTouch:true,isMobile:true,reducedMotion:'reduce'});
  try{
   const p=await ctx.newPage();await p.goto(base+'/#home');await p.waitForLoadState('networkidle');
   assert(await p.locator('.command-navigation').isHidden());assert(await p.locator('.scroll-caterpillar').isHidden());assert.equal(await p.locator('.home-actions kbd').count(),0);
   await p.locator('.phone-nav a[href="#about"]').tap();await p.locator('#about-view').waitFor({state:'visible'});
   assert.equal((await p.locator('.fact-roll').innerText()).trim(),'press');assert.equal(await p.locator('.fact-reel').count(),4);assert.equal(await p.locator('.memories>.memory:visible').count(),4);
   await p.locator('.phone-gallery-toggle').tap();assert.equal(await p.locator('.memories>.memory:visible').count(),8);assert.equal(await p.locator('.phone-gallery-toggle').getAttribute('aria-expanded'),'true');
   await p.locator('.phone-nav a[href="#about"]').tap();assert.equal(await p.evaluate(()=>scrollY),0,'Current destination must return to the top');
   await p.getByRole('button',{name:'Enlarge Yolanda’s photo',exact:true}).tap();
   const dialog=p.locator('dialog.photo-zoom');assert(await dialog.isVisible());assert(await dialog.evaluate(el=>el.scrollWidth<=el.clientWidth+1));
   assert(await dialog.evaluate(el=>el.querySelector('.player-details').getBoundingClientRect().top>=el.querySelector('.player-card:not(.frame-drawing)>.image').getBoundingClientRect().bottom));
   await dialog.locator('.player-details dd').last().scrollIntoViewIfNeeded();await p.screenshot({path:path.join(out,`phone-card-details-${width}.png`)});
   await p.getByRole('button',{name:'Close enlarged photo',exact:true}).tap();
   await p.locator('.phone-nav a[href="#work"]').tap();await p.locator('#work-view').waitFor({state:'visible'});
   assert.equal(await p.locator('#work-view .entry:visible').count(),7);assert.equal(await p.locator('.phone-summary:visible').count(),7);
   for(const selector of ['.stats-toggle','#work-stats','.work-filters','.years','.work-focus'])assert(await p.locator(selector).first().isHidden());
   for(const entry of await p.locator('#work-view .entry').all()){assert(await entry.locator('button[data-work-type]').first().isDisabled());assert(await entry.locator('.work-tag.technology').count()>0);}
   await p.locator('.phone-menu-toggle').tap();assert.equal(await p.locator('.phone-menu-toggle').getAttribute('aria-expanded'),'true');
   await p.locator('#phone-menu a[href="#acknowledgements"]').tap();await p.locator('#acknowledgements-view').waitFor({state:'visible'});assert(await p.locator('#phone-menu').isHidden());
   for(const a of await p.locator('#phone-menu a[target="_blank"]').all())assert((await a.getAttribute('rel')).includes('noopener'));
   await p.locator('.phone-menu-toggle').focus();await p.keyboard.press('Enter');assert(await p.locator('#phone-menu').isVisible());await p.keyboard.press('Escape');assert(await p.locator('#phone-menu').isHidden());
   assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await p.screenshot({path:path.join(out,`phone-final-${width}.png`)});
  }finally{await ctx.close();}
 }
 // A desktop filter cannot hide phone roles; a hidden desktop chart cannot block Home.
 await page.setViewportSize({width:1280,height:900});await page.goto(base+'/#work');await page.locator('.work-filters button').filter({hasText:/^GTM$/}).click();await page.locator('.stats-toggle').click();await page.locator('.identity').click();await page.setViewportSize({width:390,height:844});await page.locator('.phone-nav a[href="#work"]').click();await page.locator('#work-view').waitFor({state:'visible'});assert.equal(await page.locator('#work-view .entry:visible').count(),7);assert(!(await page.locator('.stats-dialog').evaluate(e=>e.open)));await page.locator('.phone-nav a[href="#home"]').click();await page.locator('.hero').waitFor({state:'visible'});await page.setViewportSize({width:1280,height:900});await page.goto(base);
}
module.exports={checkPhone};
