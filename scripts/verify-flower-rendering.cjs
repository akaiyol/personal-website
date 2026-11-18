const assert=require('assert'),fs=require('fs'),path=require('path');
// Compare actual pixels across accelerated rendering and the two recovery paths.
async function checkFlowerRendering(browser,base,out){
 fs.mkdirSync(out,{recursive:true});const reference=new Map(),results=[];
 for(const mode of ['worker','no-worker','worker-load-failure']){
  const context=await browser.newContext({viewport:{width:1280,height:900},reducedMotion:'reduce'});
  try{
   if(mode==='no-worker')await context.addInitScript(()=>{window.Worker=undefined});
   if(mode==='worker-load-failure')await context.route('**/assets/flower-study/bloom-worker.js?*',route=>route.abort());
   const page=await context.newPage(),errors=[];page.on('pageerror',error=>errors.push(error.message));
   await page.goto(base+'/?flower-rendering='+mode+'#work');await page.waitForLoadState('networkidle');
   const field=page.locator('#flower-field'),art=page.locator('#flower-art');await field.scrollIntoViewIfNeeded();await field.focus();
   for(const width of [1280,390,320]){
    await page.setViewportSize({width,height:900});await field.scrollIntoViewIfNeeded();
    for(const state of ['full','partial','empty']){
     await page.keyboard.press(state==='full'?'End':'Home');
     if(state==='partial')for(let i=0;i<20;i++)await page.keyboard.press('ArrowRight');
     await page.waitForFunction(expected=>{const art=document.querySelector('#flower-art');return art.dataset.progress===expected&&art.dataset.bloomPending==='false';},state==='full'?'1.000000':state==='partial'?'0.800000':'0.000000');
     const pixels=await art.evaluate(el=>Array.from(el.getContext('2d').getImageData(0,0,el.width,el.height).data));
     const alpha=pixels.filter((_,i)=>i%4===3).reduce((n,v)=>n+(v>0),0);
     assert(state==='empty'?alpha===0:alpha>1000,'Missing rendered flowers or stale heads after rewind');
     const key=width+'-'+state;let meanDifference=0;
     if(mode==='worker')reference.set(key,pixels);
     else{const expected=reference.get(key);assert.equal(pixels.length,expected.length);for(let i=0;i<pixels.length;i++)meanDifference+=Math.abs(pixels[i]-expected[i]);meanDifference/=pixels.length;assert(meanDifference<1,'Worker and fallback artwork differ: '+meanDifference);}
     await art.screenshot({path:path.join(out,`${mode}-${key}.png`)});results.push({mode,width,state,alpha,meanDifference});
    }
   }
   assert.deepStrictEqual(errors,[]);
  }finally{await context.close();}
 }
 fs.writeFileSync(path.join(out,'rendering-parity.json'),JSON.stringify(results,null,2));return results;
}
module.exports={checkFlowerRendering};
if(require.main===module){
 const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'/Users/yolanda/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
 (async()=>{const browser=await chromium.launch({headless:true});try{await checkFlowerRendering(browser,process.argv[2],process.argv[3]);console.log('Flower pixels, growth/rewind, resize and fallback parity passed');}finally{await browser.close();}})().catch(error=>{console.error(error);process.exitCode=1});
}
