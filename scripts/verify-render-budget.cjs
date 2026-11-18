const assert=require('assert'),fs=require('fs'),path=require('path');
// Controlled scheduler fixtures exercise both frame-budget policies independently
// of load from other test browsers. They are not physical-GPU benchmarks.
async function checkRenderBudget(browser,base,out){
 fs.mkdirSync(out,{recursive:true});const results=[];
 for(const slow of [false,true]){
  const context=await browser.newContext({viewport:{width:1280,height:900},deviceScaleFactor:2});
  try{
   if(!slow)await context.addInitScript(()=>{const original=window.requestAnimationFrame;let actualLast=null,virtual=performance.now();window.requestAnimationFrame=callback=>original.call(window,time=>{if(time!==actualLast){actualLast=time;virtual+=1000/60;}callback(virtual);});});
   if(slow)await context.addInitScript(()=>{const request=window.requestAnimationFrame.bind(window),cancel=window.cancelAnimationFrame.bind(window),jobs=new Map();let next=0;window.requestAnimationFrame=callback=>{const id=++next,job={};jobs.set(id,job);job.raf=request(()=>{job.timer=setTimeout(()=>{if(!jobs.has(id))return;jobs.delete(id);callback(performance.now());},34);});return id;};window.cancelAnimationFrame=id=>{const job=jobs.get(id);if(!job)return;cancel(job.raf);clearTimeout(job.timer);jobs.delete(id);};});
   const page=await context.newPage();await page.goto(base+'/?render-budget='+slow);await page.waitForLoadState('networkidle');
   await page.waitForFunction(()=>document.querySelector('#home-planet').dataset.renderer==='accelerated');
   const hero=await page.locator('.hero').boundingBox();
   if(slow)await page.waitForFunction(()=>Number(document.querySelector('#home-planet').dataset.pixelRatio)===1,null,{timeout:10000});
   else await page.waitForTimeout(1800);
   assert.deepStrictEqual(await page.locator('.hero').boundingBox(),hero,'Resolution adaptation moved foreground content');
   const art=page.locator('#home-planet');const ratio=Number(await art.getAttribute('data-pixel-ratio'));assert.equal(ratio,slow?1:2);
   await page.emulateMedia({reducedMotion:'reduce'});const phase=await art.getAttribute('data-phase');await page.waitForTimeout(200);assert.equal(await art.getAttribute('data-phase'),phase);
   await art.focus();const before=await art.getAttribute('data-orientation');await page.keyboard.press('ArrowLeft');assert.notEqual(await art.getAttribute('data-orientation'),before);
   await page.screenshot({path:path.join(out,slow?'sustained-slow-cadence.png':'normal-cadence.png')});
   results.push({controlledSlowCadence:slow,pixelRatio:ratio,foregroundUnchanged:true,reducedMotionAndKeyboard:true});
  }finally{await context.close();}
 }
 fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(results,null,2));return results;
}
module.exports={checkRenderBudget};
if(require.main===module){const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'/Users/yolanda/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');(async()=>{const browser=await chromium.launch({headless:true});try{await checkRenderBudget(browser,process.argv[2],process.argv[3]);console.log('Normal/slow frame cadence, stable foreground and reduced-motion input passed');}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});}
