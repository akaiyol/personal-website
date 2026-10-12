#!/usr/bin/env node
const fs=require('fs'),path=require('path'),http=require('http'),assert=require('assert'),cp=require('child_process');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'/Users/yolanda/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=path.resolve(__dirname,'../../..'),out=path.resolve(process.argv[2]||`/private/tmp/website-verification-${Date.now()}`),only=process.argv[3]||'all';
fs.mkdirSync(out,{recursive:true});const revision=cp.execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim();
const actions=[],errors=[],results=[];let browser,context,server;
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.svg':'image/svg+xml','.woff2':'font/woff2','.ttf':'font/ttf','.txt':'text/plain'};
function log(feature,action){actions.push({feature,action,time:new Date().toISOString()});console.log(`${feature}: ${action}`)}
async function evidence(page,name){await page.screenshot({path:path.join(out,name+'.png'),fullPage:true});fs.writeFileSync(path.join(out,name+'.aria.txt'),await page.locator('body').ariaSnapshot())}
async function checkLayout(page){assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Horizontal overflow');}
(async()=>{try{
 server=http.createServer((req,res)=>{let url;try{url=decodeURIComponent(new URL(req.url,'http://localhost').pathname)}catch{res.writeHead(400);return res.end()}
 if(url==='/__doctor'){res.setHeader('Content-Type','application/json');return res.end(JSON.stringify({root,revision,pid:process.pid}))}
 const rel=url==='/'?'index.html':url.slice(1);const file=path.resolve(root,rel);
 const allowed=(/^[\w-]+\.(html|css|js)$/.test(rel)&&!rel.includes('mock')&&!rel.includes('static'))||/^(assets|photos)\/[\w/ .-]+$/.test(rel);
 if(!allowed||!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);return res.end()}
 res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');fs.createReadStream(file).pipe(res)});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const base=`http://127.0.0.1:${server.address().port}`;
 const doctor=await(await fetch(base+'/__doctor')).json();assert.equal(doctor.root,root);assert.equal(doctor.revision,revision);fs.writeFileSync(path.join(out,'doctor.json'),JSON.stringify(doctor,null,2));
 browser=await chromium.launch({headless:true});context=await browser.newContext({viewport:{width:1280,height:900},recordVideo:{dir:out,size:{width:1280,height:900}},permissions:['clipboard-read','clipboard-write']});
 await context.tracing.start({screenshots:true,snapshots:true,sources:true});const page=await context.newPage();page.on('pageerror',e=>errors.push(String(e)));page.on('response',r=>{if(r.status()>=400&&r.url().startsWith(base))errors.push(`${r.status()} ${r.url()}`)});
 await page.goto(base);await page.waitForLoadState('networkidle');
 const cases={
 navigation:async()=>{
  log('navigation','Home button → About; identity → Home; number shortcuts 1 and 2');
  await evidence(page,'home-desktop');await page.locator('[data-command="about"]').click();await page.locator('#about-view').waitFor({state:'visible'});await page.locator('.identity').click();await page.locator('.intro').click();await page.keyboard.press('1');await page.locator('#about-view').waitFor({state:'visible'});await page.locator('.identity').click();await page.locator('.intro').click();await page.keyboard.press('2');await page.locator('#work-view').waitFor({state:'visible'});
  log('navigation','Terminal completion, arrows, Escape, no match, and routing');const command=page.locator('#command');await command.fill('abo');await page.keyboard.press('Tab');assert.equal(await command.inputValue(),'about-me');await page.keyboard.press('Enter');await page.locator('#about-view').waitFor({state:'visible'});assert.equal(await command.getAttribute('aria-expanded'),'false');assert(await command.evaluate(el=>el!==document.activeElement));
  await command.fill('zzzz');await page.locator('#navigation-hint').filter({hasText:'No matching destination.'}).waitFor({state:'attached'});await command.fill('');await page.keyboard.press('ArrowDown');await page.keyboard.press('Escape');assert.equal(await command.getAttribute('aria-expanded'),'false');await command.fill('home');await page.keyboard.press('Enter');await page.locator('.hero').waitFor({state:'visible'});await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>getComputedStyle(document.activeElement).outlineStyle),'none');await evidence(page,'navigation');await checkLayout(page);
 },
 about:async()=>{
  log('about','About from home → copy email, social links, photo open/close, poem word');await page.goto(base+'/#home');await page.locator('[data-command="about"]').click();await page.locator('#about-view').waitFor({state:'visible'});
  for(const href of ['https://github.com/akaiyol','https://www.linkedin.com/in/yolanda-chen1/','https://x.com/akaiyol'])assert.equal(await page.locator(`.portrait-socials a[href="${href}"]`).count(),1);
  await page.locator('[data-copy-email]').click();await page.getByText('Copied',{exact:true}).waitFor();assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),'yolanda.chen@uwaterloo.ca');
  await page.getByRole('button',{name:'Enlarge Yolanda’s photo',exact:true}).click();await page.getByRole('dialog',{name:'Enlarged photo'}).waitFor();await page.keyboard.press('Escape');await page.getByRole('dialog',{name:'Enlarged photo'}).waitFor({state:'hidden'});
  await page.locator('.poem-word').focus();assert(await page.locator('.poem-word').evaluate(el=>el.classList.contains('is-reading')));await page.keyboard.press('Escape');await evidence(page,'about-desktop');await checkLayout(page);
 },
 facts:async()=>{
  log('facts','About → roll facts by click and keyboard 1');await page.goto(base+'/#about');await page.locator('.fact-roll').waitFor({state:'visible'});await page.waitForFunction(()=>!document.querySelector('.fact-roll').disabled);
  await page.locator('.fact-roll').click();await page.waitForFunction(()=>!document.querySelector('.fact-roll').disabled&&document.querySelector('.fact-results').getAttribute('aria-busy')==='false');assert.equal(await page.locator('.fact-results p').count(),4);await page.locator('h1#about-title').click();await page.keyboard.press('1');await page.waitForFunction(()=>!document.querySelector('.fact-roll').disabled);await evidence(page,'facts');
 },
 work:async()=>{
  log('work','Home → Work; filter AI product; reset All; year 2023; scroll to cat');await page.goto(base+'/#home');await page.locator('[data-command="work"]').click();await page.locator('#work-view').waitFor({state:'visible'});await page.locator('.work-filters button').filter({hasText:/^AI product$/}).click();assert(await page.locator('.work-filter-status').textContent().then(s=>s.includes('AI product')));await page.locator('.work-filters button').filter({hasText:/^All$/}).click();await page.locator('.years a[href="#work/2023"]').click();await page.locator('.timeline-cat').scrollIntoViewIfNeeded();await checkLayout(page);
  assert.equal(await page.locator('.timeline-end .timeline-cat').count(),1);const sizes=await page.locator('.timeline-end').evaluate(el=>({tail:parseFloat(getComputedStyle(el).paddingBottom),entry:[...el.querySelectorAll('.entry')].filter(e=>!e.hidden).at(-1).offsetHeight}));assert(Math.abs(sizes.tail-sizes.entry)<2,'Tail gap differs from one entry');
  await evidence(page,'work-cat-desktop');
  log('work','Record complete 1.6-second animation plus transition into next loop');const canvas=page.locator('.timeline-cat canvas');let hashes=[];for(let i=0;i<19;i++){await canvas.screenshot({path:path.join(out,`tail-${String(i).padStart(2,'0')}.png`)});hashes.push(await canvas.evaluate(el=>el.toDataURL()));await page.waitForTimeout(100)}assert(new Set(hashes).size>5,'Cat tail is not animating');
  await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(100);const still=await canvas.evaluate(el=>el.toDataURL());await page.waitForTimeout(300);assert.equal(await canvas.evaluate(el=>el.toDataURL()),still,'Reduced motion changes');await evidence(page,'work-reduced-motion');await page.emulateMedia({reducedMotion:'no-preference'});
  log('work','Navigate away: canvas pauses offscreen');await page.locator('.identity').click();await page.waitForTimeout(100);const hidden=await canvas.evaluate(el=>el.toDataURL());await page.waitForTimeout(300);assert.equal(await canvas.evaluate(el=>el.toDataURL()),hidden,'Hidden route animates');
  for(const width of [390,320]){await page.setViewportSize({width,height:844});await page.locator('[data-command="work"]').click();await page.locator('.timeline-cat').scrollIntoViewIfNeeded();await checkLayout(page);await evidence(page,`work-cat-${width}`);await page.locator('.identity').click()}
  await page.setViewportSize({width:1280,height:900});
 },
 acknowledgements:async()=>{
  log('acknowledgements','Terminal → acknowledgements; left alignment and narrow layouts');await page.locator('#command').fill('acknowledgements');await page.keyboard.press('Enter');await page.locator('#acknowledgements-view').waitFor({state:'visible'});assert.equal(await page.title(),'Yolanda | acknowledgements');const positions=await page.locator('#acknowledgements-view').evaluate(el=>({left:el.getBoundingClientRect().left,parent:el.parentElement.getBoundingClientRect().left,padding:parseFloat(getComputedStyle(el.parentElement).paddingLeft)}));assert(Math.abs(positions.left-positions.parent-positions.padding)<2);await evidence(page,'acknowledgements-desktop');
  for(const route of ['about','home','acknowledgements']){await page.setViewportSize({width:390,height:844});await page.locator('#command').fill(route);await page.keyboard.press('Enter');await checkLayout(page);await evidence(page,route+'-390')}await page.setViewportSize({width:1280,height:900});
 }
 };
 for(const [name,run] of Object.entries(cases)){if(only!=='all'&&only!==name)continue;await run();results.push({feature:name,status:'passed'});fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({revision,results,errors,actions},null,2))}
 assert.equal(errors.length,0,errors.join('\n'));
 }catch(e){results.push({status:'failed',error:e.stack});process.exitCode=1;console.error(e.stack)}finally{
 if(context){try{await context.tracing.stop({path:path.join(out,'trace.zip')})}catch{}await context.close()}
 if(browser)await browser.close();if(server)await new Promise(resolve=>server.close(resolve));
 fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({revision,results,errors,actions,cleanup:'browser and owned HTTP server closed'},null,2));
 assert(fs.existsSync(path.join(out,'results.json')));console.log('Evidence retained: '+out);
 }})();
