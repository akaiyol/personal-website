const assert=require('assert'),fs=require('fs'),path=require('path');
async function checkAboutInk(browser,base,out){
 fs.mkdirSync(out,{recursive:true});const context=await browser.newContext({viewport:{width:1280,height:900}});
 try{const page=await context.newPage(),errors=[];page.on('pageerror',error=>errors.push(error.message));await page.goto(base+'/?about-ink-test#about');await page.waitForLoadState('networkidle');
 const portrait=page.locator('#about-view > .introduction .portrait:not(.frame-drawing)'),ink=portrait.locator('.frame-drawing');
 await portrait.scrollIntoViewIfNeeded();await page.waitForFunction(()=>getComputedStyle(document.querySelector('#about-view .portrait:not(.frame-drawing) .frame-drawing')).animationPlayState==='running');
 await page.screenshot({path:path.join(out,'portrait-visible.png')});
 await page.locator('.handwritten-poem').scrollIntoViewIfNeeded();await page.waitForFunction(()=>getComputedStyle(document.querySelector('#about-view .portrait:not(.frame-drawing) .frame-drawing')).animationPlayState==='paused');
 assert((await portrait.boundingBox()).y<0,'Portrait did not leave viewport');await page.screenshot({path:path.join(out,'portrait-offscreen.png')});
 await portrait.scrollIntoViewIfNeeded();await page.waitForFunction(()=>getComputedStyle(document.querySelector('#about-view .portrait:not(.frame-drawing) .frame-drawing')).animationPlayState==='running');
 await page.getByRole('button',{name:'Enlarge Yolanda’s photo',exact:true}).click();await page.locator('.photo-zoom[open]').waitFor();
 assert.equal(await page.locator('.photo-zoom .frame-drawing').evaluate(el=>getComputedStyle(el).animationPlayState),'running','Dialog inherited an offscreen pause');await page.screenshot({path:path.join(out,'portrait-dialog.png')});await page.keyboard.press('Escape');
 await page.emulateMedia({reducedMotion:'reduce'});assert.equal(await ink.evaluate(el=>getComputedStyle(el).animationName),'none');
 assert.deepStrictEqual(errors,[]);fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({visibleRuns:true,offscreenPauses:true,resumes:true,dialogRuns:true,reducedMotionStatic:true,errors},null,2));
 }finally{await context.close();}
}
module.exports={checkAboutInk};
if(require.main===module){const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'/Users/yolanda/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');(async()=>{const browser=await chromium.launch({headless:true});try{await checkAboutInk(browser,process.argv[2],process.argv[3]);console.log('Visible/offscreen ink animation, dialog and reduced motion passed');}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});}
