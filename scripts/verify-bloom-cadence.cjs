const assert=require('assert'),fs=require('fs'),path=require('path');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'/Users/yolanda/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
// Count only distinct bloom stages actually drawn onto the field, not desired
// stages or animation callbacks. Run alone: parallel browser tests skew cadence.
async function checkBloomCadence(browser,base,out){
 fs.mkdirSync(out,{recursive:true});
 const context=await browser.newContext({viewport:{width:1470,height:864}});
 try{
  await context.route(/(static\.cloudflareinsights\.com\/beacon|\/cdn-cgi\/rum)/,route=>route.abort());
  await context.addInitScript(()=>{
   const bitmaps=new WeakMap(),seen=new Map(),NativeWorker=Worker;
   window.__bloomPaints=[];
   window.Worker=class extends NativeWorker{
    constructor(...args){
     super(...args);const pending=[],post=this.postMessage.bind(this);
     this.postMessage=(data,...rest)=>{
      if(data.batch)pending.push({frames:data.batch.map(f=>({id:f.plant.id,stage:f.stage}))});
      else if(data.plant)pending.push({id:data.plant.id,stage:data.stage});
      return post(data,...rest);
     };
     this.addEventListener('message',({data})=>{
      if(data.bitmap){const request=pending.shift();if(request)bitmaps.set(data.bitmap,data.frames?{frames:data.frames}:request);}
     });
    }
   };
   const draw=CanvasRenderingContext2D.prototype.drawImage;
   CanvasRenderingContext2D.prototype.drawImage=function(source,...args){
    const result=bitmaps.get(source);
    const frame=result?.frames?result.frames.find(f=>f.tile[0]===args[0]&&f.tile[1]===args[1]):result;
    if(this.canvas.id==='flower-art'&&frame&&seen.get(frame.id)!==frame.stage){
     seen.set(frame.id,frame.stage);__bloomPaints.push({id:frame.id,stage:frame.stage,at:performance.now()});
    }
    return draw.call(this,source,...args);
   };
  });
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base+'/?bloom-cadence-check#work');await page.waitForLoadState('networkidle');
  await page.locator('#flower-field').scrollIntoViewIfNeeded();
  await page.waitForFunction(()=>{const a=document.querySelector('#flower-art');return a.dataset.intro==='complete'&&a.dataset.bloomPending==='false';});
  const painted=await page.evaluate(()=>__bloomPaints);
  const plants=Array.from({length:11},(_,id)=>{
   const states=painted.filter(p=>p.id===id&&p.stage>.53&&p.stage<1);
   return {id,openingShapes:states.length,maxGapMs:Math.max(0,...states.slice(1).map((s,i)=>s.at-states[i].at))};
  });
  const result={renderer:await page.locator('#flower-art').getAttribute('data-bloom-renderer'),plants,painted,errors};
  fs.writeFileSync(path.join(out,'bloom-cadence.json'),JSON.stringify(result,null,2));
  assert.deepStrictEqual(errors,[]);
  for(const p of plants){assert(p.openingShapes>=18,`Flower ${p.id}: only ${p.openingShapes} painted opening shapes`);assert(p.maxGapMs<=85,`Flower ${p.id}: ${p.maxGapMs.toFixed(1)} ms opening gap`);}
  console.log(JSON.stringify({renderer:result.renderer,plants}));return result;
 }finally{await context.close();}
}
module.exports={checkBloomCadence};
if(require.main===module)(async()=>{const browser=await chromium.launch({headless:true});try{await checkBloomCadence(browser,process.argv[2],process.argv[3]);}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});
