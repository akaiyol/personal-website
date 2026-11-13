#!/usr/bin/env node
// On-demand artifact evaluation. Visual acceptance is deliberately not automated.
const fs=require('fs'),path=require('path'),http=require('http'),cp=require('child_process'),crypto=require('crypto'),assert=require('assert');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||path.join(require('os').homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
const study=__dirname,root=path.resolve(study,'../..'),out=path.resolve(process.argv[2]||'/private/tmp/planet-evaluation-'+Date.now()),quick=process.argv.includes('--quick');
if(fs.existsSync(out))throw Error('Use a fresh evidence directory: '+out);fs.mkdirSync(out,{recursive:true});
const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const checks=[],errors=[],renders=[],motion=[],timings=[];
const result={revision:cp.execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim(),rendererSha256:hash(path.join(study,'planet-lumen.js')),baselineSha256:hash(path.join(study,'evaluation/baseline-3594661.js')),artifactSha256:Object.fromEntries(['planet-lumen.js','jupiter-voyager.jpg','frame.html','evaluate.cjs','lumen/render.js','lumen/dither.js','lumen/looks.js','lumen/glow.js'].map(p=>[p,hash(path.join(study,p))])),mode:quick?'quick':'full',checks,errors,renders,motion,timings,visualReview:'pending human inspection',limitations:['Safari and physical touch not tested','Real background-tab visibility not established by this headless harness'],cleanup:false};
let server,browser;
async function check(name,fn){try{await fn();checks.push({name,status:'pass'});}catch(e){checks.push({name,status:'fail',reason:e.message});}}
const types={'.js':'text/javascript','.cjs':'text/plain','.html':'text/html','.css':'text/css','.png':'image/png','.svg':'image/svg+xml','.jpg':'image/jpeg','.woff2':'font/woff2'};
const frame='/mockups/planet-lumen-study/frame.html';
async function shot(page,file){await page.screenshot({path:path.join(out,file)});renders.push({file,viewport:page.viewportSize()});}
function watch(page){page.on('pageerror',e=>errors.push(e.message));}
async function ready(page){await page.waitForLoadState('networkidle');await page.waitForFunction(()=>document.querySelector('#home-planet')?.dataset.frame);}
const bounds=page=>page.evaluate(()=>[...document.querySelectorAll('.hero h1,.hero .intro,.hero .description,.hero .cta')].filter(e=>e.getClientRects().length).map(e=>{const r=e.getBoundingClientRect();return [r.x,r.y,r.width,r.height].map(n=>Math.round(n*100)/100)}));
(async()=>{try{
 server=http.createServer((req,res)=>{const url=new URL(req.url,'http://localhost');let file=path.resolve(root,'.'+decodeURIComponent(url.pathname));if((file!==root&&!file.startsWith(root+path.sep))||/\/(?:\.git|\.agents|\.codex)(?:\/|$)/.test(file)){res.writeHead(403);res.end();return;}try{if(fs.statSync(file).isDirectory())file=path.join(file,'index.html');res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');res.setHeader('Cache-Control','no-store');res.end(fs.readFileSync(file));}catch{res.writeHead(404);res.end();}});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const base='http://127.0.0.1:'+server.address().port;
 browser=await chromium.launch({headless:true});
 const page=await browser.newPage({viewport:{width:1280,height:800},reducedMotion:'reduce'});watch(page);
 const baselinePage=await browser.newPage({viewport:{width:1280,height:800},reducedMotion:'reduce'});watch(baselinePage);
 await baselinePage.route('**/planet-lumen.js',r=>r.fulfill({path:path.join(study,'evaluation/baseline-3594661.js'),contentType:'text/javascript'}));
 for(const viewport of [{width:1280,height:800},{width:1470,height:864},{width:390,height:844},{width:320,height:844}]){
  await page.setViewportSize(viewport);await baselinePage.setViewportSize(viewport);
  await baselinePage.goto(base+frame+'?material=prism');await ready(baselinePage);const referenceBounds=await bounds(baselinePage);
  await shot(baselinePage,'baseline-prism-'+viewport.width+'.png');
  for(const material of ['prism','opal','solar']){
   await page.goto(base+frame+'?material='+material);await ready(page);await shot(page,material+'-'+viewport.width+'.png');
   await check(material+' '+viewport.width+' layout',async()=>{assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));assert.deepStrictEqual(await bounds(page),referenceBounds);});
  }
 }
 await page.setViewportSize({width:1280,height:800});await page.goto(base+frame);await ready(page);
 const planet=page.locator('#home-planet');
 await check('all keyboard directions',async()=>{await planet.focus();for(const key of ['ArrowLeft','ArrowRight','ArrowUp','ArrowDown']){const before=await planet.getAttribute('data-rotation');await page.keyboard.press(key);assert.notEqual(await planet.getAttribute('data-rotation'),before);}});
 await check('drag in both directions',async()=>{const b=await planet.boundingBox();for(const dx of [-60,60]){const before=await planet.getAttribute('data-rotation');await page.mouse.move(b.x+b.width*.8,b.y+b.height*.4);await page.mouse.down();await page.mouse.move(b.x+b.width*.8+dx,b.y+b.height*.4+20,{steps:8});await page.mouse.up();const after=await planet.getAttribute('data-rotation');assert.notEqual(after,before);assert.equal(Math.sign(Number(after.split(',')[0])-Number(before.split(',')[0])),Math.sign(dx));}});
 await check('reduced motion freezes phase',async()=>{const before=await planet.getAttribute('data-phase');await page.waitForTimeout(350);assert.equal(await planet.getAttribute('data-phase'),before);});
 await check('route pause and return',async()=>{await page.locator('[data-command="about"]').click();await page.locator('#about-view').waitFor({state:'visible'});const f=await planet.getAttribute('data-frame');await page.waitForTimeout(300);assert.equal(await planet.getAttribute('data-frame'),f);await page.locator('.identity').click();await planet.waitFor({state:'visible'});assert.equal(await planet.getAttribute('data-intro'),'complete');});
 await page.goto(base+frame);await ready(page);
 await check('hover hint and stationary foreground',async()=>{const b=await planet.boundingBox(),before=await bounds(page);await page.mouse.move(b.x+b.width*.89,b.y+b.height*.58);await page.locator('#planet-drag-hint').waitFor({state:'visible'});assert.deepStrictEqual(await bounds(page),before);await page.mouse.move(1,1);await page.locator('#planet-drag-hint').waitFor({state:'hidden'});});
 await page.goto(base+'/mockups/planet-lumen-study/');await page.waitForLoadState('networkidle');
 await check('material selector',async()=>{for(const name of ['Opal giant','Solar bloom','Prismatic atmosphere']){await page.getByRole('button',{name,exact:true}).click();await page.waitForTimeout(350);assert.equal(await page.getByRole('button',{name,exact:true}).getAttribute('aria-pressed'),'true');await page.frameLocator('#preview').locator('#home-planet').waitFor();}});
 await baselinePage.close();await page.close();
 const live=await browser.newPage({viewport:{width:1280,height:800},recordVideo:{dir:path.join(out,'video'),size:{width:1280,height:800}}});watch(live);
 await live.addInitScript(()=>{window.__planetIntervals=[];window.__planetLongTasks=[];new PerformanceObserver(list=>window.__planetLongTasks.push(...list.getEntries().map(e=>e.duration))).observe({entryTypes:['longtask']});document.addEventListener('DOMContentLoaded',()=>{const c=document.querySelector('#home-planet');let previous=0;new MutationObserver(()=>{const now=performance.now();if(previous)window.__planetIntervals.push(now-previous);previous=now;}).observe(c,{attributes:true,attributeFilter:['data-frame']});});});
 await live.goto(base+frame);await live.waitForFunction(()=>document.querySelector('#home-planet').dataset.frame);
 for(let i=0;i<7;i++){const file='entrance-'+i+'.png';await shot(live,file);motion.push({file,kind:'entrance',phase:await live.locator('#home-planet').getAttribute('data-phase')});await live.waitForTimeout(450);}
 await check('entrance settles',async()=>assert.equal(await live.locator('#home-planet').getAttribute('data-intro'),'complete'));
 if(!quick){
  const start=Date.now();let previous=0,wraps=0;
  while(Date.now()-start<67000){const phase=Number(await live.locator('#home-planet').getAttribute('data-phase'));if(phase<previous)wraps++;previous=phase;const file='cycle-'+String(motion.filter(x=>x.kind==='cycle').length).padStart(2,'0')+'.png';await shot(live,file);motion.push({file,kind:'cycle',elapsedMs:Date.now()-start,phase});await live.waitForTimeout(4000);}
  await check('full real-time axial cycle and continuation',async()=>assert(wraps>=1,'No observed phase wrap'));
 }else result.limitations.push('Full rotation omitted in quick mode');
 timings.push(await live.evaluate(()=>{const a=window.__planetIntervals.slice(10).sort((a,b)=>a-b);return {frames:a.length,medianIntervalMs:a[Math.floor(a.length*.5)],p95IntervalMs:a[Math.floor(a.length*.95)],longTasks:window.__planetLongTasks};}));
 await check('no page errors',async()=>assert.deepStrictEqual(errors,[]));
 await live.close();
 }catch(e){checks.push({name:'harness execution',status:'fail',reason:e.stack});}
 finally{if(browser)await browser.close();if(server)await new Promise(resolve=>server.close(resolve));result.cleanup=true;fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(result,null,2));fs.writeFileSync(path.join(out,'REVIEW.md'),'# Visual review pending\n\nSource SHA-256: '+result.rendererSha256+'\n\nInspect every listed render and the ordered motion frames/video against evaluation/CRITERIA.md. Record V1–V6 separately from automated B checks. This file is not a visual pass.\n');console.log(JSON.stringify({out,checks,errors,cleanup:result.cleanup}));if(checks.some(x=>x.status==='fail'))process.exitCode=1;}
})();
