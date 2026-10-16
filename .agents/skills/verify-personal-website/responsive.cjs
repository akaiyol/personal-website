const assert=require('assert'),fs=require('fs'),path=require('path');
async function checkResponsive(page,base,out){
 const observations=[];
 const sizes=[[1920,1080],[1470,864],[1280,800],[1024,768],[820,1180],[801,900],[800,900],[701,900],[700,900],[600,900],[390,844],[320,740]];
 await page.emulateMedia({reducedMotion:'reduce'});
 for(const [width,height] of sizes){
  await page.setViewportSize({width,height});
  for(const route of ['home','about','work','projects','acknowledgements']){
   await page.goto(base+'/#'+route);await page.waitForTimeout(100);
   const state=await page.evaluate(({route,width,height})=>{
    const box=s=>{const r=document.querySelector(s).getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height,right:r.right,bottom:r.bottom}};
    return {route,width,height,overflow:document.documentElement.scrollWidth-innerWidth,shell:box('.terminal'),footer:box('.terminal > footer'),header:box('.terminal > header'),cat:box('.scroll-caterpillar'),intro:box('.introduction'),story:box('.story'),blurb:box('.background'),console:box('.fact-console')};
   },{route,width,height});observations.push(state);
   assert(state.overflow<=1,`${route} ${width}: document overflow`);
   assert(Math.abs(state.footer.x-state.shell.x)<1 && Math.abs(state.footer.width-state.shell.width)<1,`${route} ${width}: footer/shell mismatch`);
   if(route!=='home'){
    assert(Math.abs(state.shell.right-state.cat.right-3)<1,`${route} ${width}: caterpillar right alignment`);
    assert(state.cat.y>=state.header.bottom,`${route} ${width}: caterpillar overlaps header`);
    assert(state.cat.bottom<=state.footer.y-6,`${route} ${width}: caterpillar overlaps footer`);
   }
   if([1920,1470,820,390,320].includes(width))await page.screenshot({path:path.join(out,`responsive-${route}-${width}.png`),fullPage:true});
   if(route==='work'&&width>900){
    const grouping=await page.locator('#work-view .layout').evaluate(el=>{
     const r=el.getBoundingClientRect(),view=document.querySelector('#work-view').getBoundingClientRect(),heading=document.querySelector('.work-heading').getBoundingClientRect();
     const summary=document.querySelector('#work-view .summary'),s=summary.getBoundingClientRect(),content=summary.parentElement.getBoundingClientRect(),focus=summary.parentElement.querySelector('.work-focus').getBoundingClientRect();
     return {width:r.width,viewWidth:view.width,left:r.x,viewLeft:view.x,titleLeft:heading.x,summaryWidth:s.width,contentWidth:content.width,focusWidth:focus.width};
    });
    assert(Math.abs(grouping.width-grouping.viewWidth)<1&&Math.abs(grouping.left-grouping.viewLeft)<1&&Math.abs(grouping.left-grouping.titleLeft)<1,`${width}: timeline shifted or work group capped`);
    assert(Math.abs(grouping.summaryWidth-grouping.contentWidth)<1&&Math.abs(grouping.focusWidth-grouping.contentWidth)<1,`${width}: experience content does not fill its column`);
   }
   if(route==='about'){
    assert(Math.abs(state.console.width-state.blurb.width)<1,`${width}: gacha does not match sentence width`);
    if(width>=1280)assert(await page.locator('.background').evaluate(el=>{const r=document.createRange();r.selectNodeContents(el);return r.getClientRects().length===1}),`${width}: desktop blurb should fit one line`);
    assert(await page.locator('.handwritten-name .signal-slice').evaluateAll(nodes=>nodes.every(n=>getComputedStyle(n).animationName==='none'&&getComputedStyle(n).display==='none')),'Name animation remains enabled');
    if(width<=600){
     const layout=await page.locator('.fact-machine').evaluate(el=>{const reels=el.querySelector('.fact-reels').getBoundingClientRect(),roll=el.querySelector('.fact-roll').getBoundingClientRect();return {below:roll.top>=reels.bottom,columns:getComputedStyle(el.querySelector('.fact-results')).gridTemplateColumns.split(' ').length}});
     assert(layout.below&&layout.columns===2,`${width}: phone gacha layout is cramped`);
    }
    const rail=await page.locator('.memories').evaluate(el=>{const r=el.getBoundingClientRect(),cards=[...el.children].map(c=>c.getBoundingClientRect());return {centre:r.x+r.width/2,group:(Math.min(...cards.map(c=>c.left))+Math.max(...cards.map(c=>c.right)))/2}});
    assert(Math.abs(rail.centre-rail.group)<2,`${width}: gallery is not centred`);
    await page.getByRole('button',{name:'Enlarge Yolanda’s photo',exact:true}).click();
    const dialog=page.getByRole('dialog',{name:'Enlarged photo'});await dialog.waitFor();
    const star=dialog.locator('.player-card-star');
    assert.equal(await star.count(),1,'Striped star is missing');
    assert(await star.evaluate(el=>{const style=getComputedStyle(el),r=el.getBoundingClientRect(),name=el.closest('.player-card').querySelector('.player-name').getBoundingClientRect();return style.color==='rgb(197, 181, 236)'&&style.pointerEvents==='none'&&r.width>20&&r.bottom<name.top}),'Star is invisible or overlaps card text');
    assert(await dialog.evaluate(el=>{const r=el.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth}),`${width}: character card outside viewport`);
    if([1470,390,320].includes(width))await page.screenshot({path:path.join(out,`responsive-card-${width}.png`)});
    await page.keyboard.press('Escape');
    if([1470,390,320].includes(width)){
     await page.locator('.fact-machine').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,`responsive-gacha-${width}.png`)});
     await page.locator('.gallery').scrollIntoViewIfNeeded();await page.mouse.move(10,10);await page.screenshot({path:path.join(out,`responsive-gallery-${width}.png`)});
     if(width<=390){await page.locator('.gallery').hover();await page.mouse.wheel(1800,0);await page.waitForTimeout(150);assert(await page.locator('.gallery').evaluate(el=>el.scrollLeft>100),'Phone photo rail did not scroll horizontally');await page.screenshot({path:path.join(out,`responsive-gallery-end-${width}.png`)});}
    }
   }
  }
 }
 await page.setViewportSize({width:1470,height:864});await page.goto(base+'/#about');
 await page.emulateMedia({reducedMotion:'no-preference'});await page.waitForTimeout(200);
 await page.locator('.fact-roll').click();await page.waitForTimeout(350);
 await page.setViewportSize({width:390,height:844});await page.waitForTimeout(300);
 await page.setViewportSize({width:820,height:900});
 await page.waitForFunction(()=>!document.querySelector('.fact-roll').disabled);
 assert(await page.locator('.fact-track').evaluateAll(tracks=>tracks.every(t=>t.children.length===1&&!t.style.transform&&Math.abs(t.firstElementChild.getBoundingClientRect().height-t.parentElement.getBoundingClientRect().height)<1)),'Reels did not settle after live resize');
 await page.screenshot({path:path.join(out,'responsive-reels-after-live-resize.png'),fullPage:true});
 fs.writeFileSync(path.join(out,'responsive-geometry.json'),JSON.stringify(observations,null,2));
 await page.emulateMedia({reducedMotion:'no-preference'});await page.setViewportSize({width:1280,height:900});await page.goto(base);
}
module.exports={checkResponsive};
