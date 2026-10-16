#!/usr/bin/env node
const fs=require('fs'),path=require('path'),http=require('http'),assert=require('assert'),cp=require('child_process');
const {checkFlowerField}=require('./flower-field.cjs');
const {checkHomePlanet}=require('./planet.cjs');
const {checkResponsive}=require('./responsive.cjs');
const {checkFlowerIntro}=require('./flower-intro.cjs');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'/Users/yolanda/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=path.resolve(__dirname,'../../..'),out=path.resolve(process.argv[2]||`/private/tmp/website-verification-${Date.now()}`),only=process.argv[3]||'all';
fs.mkdirSync(out,{recursive:true});const revision=cp.execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim();
const actions=[],errors=[],results=[];let browser,context,server;
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.svg':'image/svg+xml','.woff2':'font/woff2','.ttf':'font/ttf','.txt':'text/plain'};
function log(feature,action){actions.push({feature,action,time:new Date().toISOString()});console.log(`${feature}: ${action}`)}
async function evidence(page,name){await page.screenshot({path:path.join(out,name+'.png'),fullPage:true});fs.writeFileSync(path.join(out,name+'.aria.txt'),await page.locator('body').ariaSnapshot())}
async function checkLayout(page){assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Horizontal overflow');}
async function checkStatsToggle(page, name) {
 const toggle=page.locator('.stats-toggle'), stats=page.locator('#work-stats');
 await toggle.scrollIntoViewIfNeeded();
 if(name==='desktop'){
  assert(await stats.isHidden(),'Stats should default to hidden');
  assert.equal(await toggle.getAttribute('aria-expanded'),'false');
  assert.equal(await toggle.locator('.stats-rays g').first().evaluate(el=>getComputedStyle(el).animationName),'stats-ray-boil');
  assert.equal(await toggle.evaluate(el=>getComputedStyle(el).opacity),'1','Button text should stay steady');
  await page.screenshot({path:path.join(out,'work-stats-default-hidden.png')});
  await toggle.click();
  assert.equal(await toggle.locator('.stats-rays').count(),0,'Discovery rays did not disappear on click');
 }
 assert(await stats.isVisible(), 'Stats should be visible after opening');
 assert.equal(await toggle.getAttribute('aria-controls'),'work-stats');
 const layoutSnapshot=()=>page.evaluate(()=>({scrollY, pageHeight:document.documentElement.scrollHeight,
  boxes:[...document.querySelectorAll('#work-title,.stats-toggle,.work-filters,#work-view .timeline,#work-view .years,#work-view .entry:not([hidden]),#work-view .work-focus,.timeline-flowers')].map(el=>{
   const r=el.getBoundingClientRect();return [r.x,r.y,r.width,r.height].map(n=>Math.round(n*100)/100);
  })}));
 const baseline=await layoutSnapshot();
 await page.screenshot({path:path.join(out,'work-stats-before-'+name+'.png')});
 await toggle.click();
 assert(await stats.isHidden(), 'Stats did not hide');
 assert.equal(await toggle.getAttribute('aria-expanded'),'false');
 assert.equal(await toggle.textContent(),'[ show stats ]');
 assert.equal(await stats.getAttribute('aria-hidden'),'true');
 assert(await stats.evaluate(el=>el.inert), 'Hidden stats must not receive keyboard input');
 assert.deepEqual(await layoutSnapshot(), baseline, 'Hiding stats moved or resized page content');
 await checkLayout(page);
 await page.screenshot({path:path.join(out,'work-stats-hidden-'+name+'.png')});
 await toggle.focus();await page.keyboard.press('Enter');
 assert(await stats.isVisible(), 'Enter did not restore stats');
 assert.equal(await toggle.getAttribute('aria-expanded'),'true');
 assert.deepEqual(await layoutSnapshot(),baseline,'Restoring stats moved or resized page content');
 await page.keyboard.press('Space');assert(await stats.isHidden(), 'Space did not hide stats');
 await toggle.click();assert(await stats.isVisible());
 await page.screenshot({path:path.join(out,'work-stats-visible-'+name+'.png')});
}
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
 planet:async()=>{log('planet','Home planet: responsive crop, foreground, drag, keys, reduced motion, route pause/resume and buttons');await checkHomePlanet(page,base,out)},
 navigation:async()=>{
  log('navigation','Home button → About; identity → Home; number shortcuts 1 and 2');
  await evidence(page,'home-desktop');await page.locator('[data-command="work"]').click();await page.locator('#work-view').waitFor({state:'visible'});assert.equal(await page.title(),'Yolanda | /work-experience');await page.locator('.identity').click();await page.locator('[data-command="about"]').click();await page.locator('#about-view').waitFor({state:'visible'});await page.locator('.identity').click();await page.locator('.intro').click();await page.keyboard.press('1');await page.locator('#about-view').waitFor({state:'visible'});await page.locator('.identity').click();await page.locator('.intro').click();await page.keyboard.press('2');await page.locator('#work-view').waitFor({state:'visible'});
  log('navigation','Terminal completion, arrows, Escape, no match, and routing');const command=page.locator('#command');await command.fill('abo');await page.keyboard.press('Tab');assert.equal(await command.inputValue(),'/about-me');await page.keyboard.press('Enter');await page.locator('#about-view').waitFor({state:'visible'});assert.equal(await command.getAttribute('aria-expanded'),'false');assert(await command.evaluate(el=>el!==document.activeElement));
  await command.fill('zzzz');await page.locator('#navigation-hint').filter({hasText:'No matching destination.'}).waitFor({state:'attached'});await command.fill('');await page.keyboard.press('ArrowDown');const down=await command.getAttribute('aria-activedescendant');await page.keyboard.press('ArrowUp');assert.notEqual(await command.getAttribute('aria-activedescendant'),down);await page.keyboard.press('Escape');assert.equal(await command.getAttribute('aria-expanded'),'false');await command.fill('home');await page.keyboard.press('Enter');await page.locator('.hero').waitFor({state:'visible'});assert.equal(await page.title(),'Yolanda | /home');await command.fill('1');assert(await page.locator('.hero').isVisible());await command.fill('');await page.keyboard.press('Escape');await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>getComputedStyle(document.activeElement).outlineStyle),'none');await command.fill('projects');await page.keyboard.press('Enter');assert(await page.locator('.hero').isVisible());assert.equal(await page.locator('#destination-view').isVisible(),false);assert(!(await page.locator('#response').textContent()).includes('/projects'));await page.goto(base+'/#projects');await page.locator('.hero').waitFor({state:'visible'});assert.equal(await page.title(),'Yolanda | /home');await command.fill('');await command.focus();assert(!(await page.locator('#suggestions').textContent()).includes('/projects'));await evidence(page,'projects-archived');await command.fill('/abo');await page.keyboard.press('Tab');assert.equal(await command.inputValue(),'/about-me');await page.keyboard.press('Enter');await page.locator('#about-view').waitFor({state:'visible'});await command.fill('/home');await page.keyboard.press('Enter');await page.locator('.hero').waitFor({state:'visible'});await command.focus();assert((await page.locator('#suggestions [role=option]>span:first-child').allTextContents()).every(label=>label.startsWith('/')));await page.keyboard.press('Escape');await evidence(page,'navigation');await checkLayout(page);
 },
 about:async()=>{
  log('about','About from home → copy email, social links, photo open/close, poem word');await page.goto(base+'/#home');await page.locator('[data-command="about"]').click();await page.locator('#about-view').waitFor({state:'visible'});assert.equal(await page.locator('.bio-quote').count(),0);
  for(const href of ['https://github.com/akaiyol','https://www.linkedin.com/in/yolanda-chen1/'])assert.equal(await page.locator(`.portrait-socials a[href="${href}"]`).count(),1);
  assert.equal(await page.locator('.portrait-socials a[href*="x.com"]').count(),0);
  await page.locator('[data-copy-email]').click();await page.getByText('Copied',{exact:true}).waitFor();assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),'yolanda.chen@uwaterloo.ca');
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.getByRole('button',{name:'Enlarge Yolanda’s photo',exact:true}).click();await page.getByRole('dialog',{name:'Enlarged photo'}).waitFor();
  assert.equal(await page.locator('.player-card-star').count(),0);
  await page.keyboard.press('Escape');await page.getByRole('dialog',{name:'Enlarged photo'}).waitFor({state:'hidden'});
  await page.locator('.poem-word').focus();assert(await page.locator('.poem-word').evaluate(el=>el.classList.contains('is-reading')));await page.keyboard.press('Escape');assert(!await page.locator('.poem-word').evaluate(el=>el.classList.contains('is-reading')));
  log('about','Memory keyboard open, unique-photo counter, close button, reposition');const memory=page.locator('#about-view .memories .memory').first();await memory.scrollIntoViewIfNeeded();const countBefore=await page.locator('.photo-counter').count()?await page.locator('.photo-counter').textContent():null;await memory.focus();await page.keyboard.press('Enter');await page.getByRole('dialog',{name:'Enlarged photo'}).waitFor();const countAfter=await page.locator('.photo-counter').count()?await page.locator('.photo-counter').textContent():null;await page.getByRole('button',{name:'Close enlarged photo',exact:true}).click();await page.waitForFunction(()=>document.querySelector('#about-view .memories .memory').getAttribute('aria-pressed')==='false');await memory.focus();await page.keyboard.press('Space');await page.getByRole('dialog',{name:'Enlarged photo'}).waitFor();if(countAfter!==null)assert.equal(await page.locator('.photo-counter').textContent(),countAfter);await page.keyboard.press('Escape');await memory.focus();const slot=await memory.evaluate(el=>el.style.getPropertyValue('--slot'));await page.keyboard.press('Alt+ArrowRight');assert.notEqual(await memory.evaluate(el=>el.style.getPropertyValue('--slot')),slot);await evidence(page,'about-desktop');await checkLayout(page);
 },
 facts:async()=>{
  log('facts','About → roll facts by click and keyboard 1');await page.goto(base+'/#about');await page.locator('.fact-roll').waitFor({state:'visible'});await page.waitForFunction(()=>!document.querySelector('.fact-roll').disabled);
  async function result(){await page.waitForFunction(()=>!document.querySelector('.fact-roll').disabled&&document.querySelector('.fact-results').getAttribute('aria-busy')==='false');if(await page.locator('.fact-machine').evaluate(el=>el.classList.contains('is-jackpot'))){assert.equal(await page.locator('.fact-results p').count(),1);assert.equal((await page.locator('.fact-results').innerText()).trim(),'labubu');assert.equal(await page.locator('.fact-track .braille-star').count(),4)}else assert.equal(await page.locator('.fact-results p').count(),4)}
  await page.locator('.fact-roll').click();assert.equal(await page.locator('.fact-results').getAttribute('aria-busy'),'true');await result();await page.locator('h1#about-title').click();await page.keyboard.press('1');assert.equal(await page.locator('.fact-results').getAttribute('aria-busy'),'true');await result();await evidence(page,'facts');
 },
 work:async()=>{
  log('work','Home → Work; filter AI product; reset All; year 2023; scroll to timeline end');await page.goto(base+'/#home');await page.locator('[data-command="work"]').click();await page.locator('#work-view').waitFor({state:'visible'});await checkStatsToggle(page,'desktop');const rbc=page.locator('[data-stats-profile="rbc-2026"]');assert.deepEqual(await rbc.locator('button[data-work-type]').allTextContents(),['AI product','GTM','Data','Engineering']);assert((await rbc.locator('.work-focus').textContent()).includes('Internal adoption & GTM strategy'));await rbc.locator('[data-work-type="GTM"]').click();assert.equal(await page.locator('#work-view .entry:visible').count(),1);assert(await rbc.isVisible());await page.locator('.work-filters button').filter({hasText:/^All$/}).click();await page.locator('.work-filters button').filter({hasText:/^AI product$/}).click();assert(await page.locator('.work-filter-status').textContent().then(s=>s.includes('AI product')));await page.locator('.work-filters button').filter({hasText:/^All$/}).click();log('work','Every work filter and per-role filter entry point');for(const kind of ['AI product','Data','Engineering','Strategy','Growth','GTM','Research']){await page.locator('.work-filters button').filter({hasText:new RegExp('^'+kind+'$')}).click();const state=await page.locator('#work-view').evaluate((view,kind)=>({matches:[...view.querySelectorAll('.entry')].filter(e=>!e.hidden).every(e=>[...e.querySelectorAll('[data-work-type]')].some(t=>t.dataset.workType===kind)),years:[...view.querySelectorAll('.timeline section')].every(section=>section.hidden===![...section.querySelectorAll('.entry')].some(e=>!e.hidden))}),kind);assert(state.matches&&state.years)}await page.locator('.work-filters button').filter({hasText:/^All$/}).click();await page.locator('.entry button[data-work-type]').first().click();assert(await page.locator('.work-filter-status').textContent().then(s=>!s.startsWith('All')));await page.locator('.work-filters button').filter({hasText:/^All$/}).click();await page.locator('.years a[href="#work/2023"]').click();
  const graph=page.locator('.strengths-graph');await graph.waitFor({state:'visible'});await page.waitForFunction(()=>document.querySelector('.strengths-graph').getAttribute('role')==='button');await graph.click();assert.equal(await graph.getAttribute('aria-pressed'),'true');await graph.focus();await page.keyboard.press('Enter');assert.equal(await graph.getAttribute('aria-pressed'),'false');await page.keyboard.press('Space');assert.equal(await graph.getAttribute('aria-pressed'),'true');assert.equal(await graph.evaluate(el=>getComputedStyle(el).outlineStyle),'none');await page.locator('.timeline-end').scrollIntoViewIfNeeded();await checkLayout(page);
  assert.equal(await page.locator('.timeline-cat').count(),0);assert.equal(await page.locator('#work-view > .timeline-flowers').count(),1);await page.waitForFunction(()=>document.querySelector('#flower-art')?.dataset.progress);
  const edge=await page.locator('.timeline-flowers').evaluate(el=>({flower:el.getBoundingClientRect().bottom,main:el.closest('main').getBoundingClientRect().bottom}));assert(Math.abs(edge.flower-edge.main)<2,'Flowers do not end at content edge');
  await checkFlowerField(page,11);await evidence(page,'work-timeline-desktop');
  await page.locator('.identity').click();
  for(const width of [390,320]){await page.setViewportSize({width,height:844});await page.locator('[data-command="work"]').click();await checkStatsToggle(page,String(width));await page.locator('.timeline-end').scrollIntoViewIfNeeded();await checkLayout(page);await checkFlowerField(page,6);await evidence(page,`work-timeline-${width}`);await page.locator('.identity').click()}
  await page.setViewportSize({width:1280,height:900});
 },
 flowerIntro:async()=>{log('flowerIntro','Automatic growth, offscreen pause, post-growth hints, shared-scale rulers, narrow and reduced-motion views');await checkFlowerIntro(page,base,out)},
 responsive:async()=>{log('responsive','Five routes at twelve sizes; shell/caterpillar alignment, centred gallery, character card and live gacha resizing');await checkResponsive(page,base,out)},
 acknowledgements:async()=>{
  log('acknowledgements','Terminal → acknowledgements; left alignment and narrow layouts');await page.locator('#command').fill('acknowledgements');await page.keyboard.press('Enter');await page.locator('#acknowledgements-view').waitFor({state:'visible'});assert.equal(await page.title(),'Yolanda | /acknowledgements');const positions=await page.locator('#acknowledgements-view').evaluate(el=>({left:el.getBoundingClientRect().left,parent:el.parentElement.getBoundingClientRect().left,padding:parseFloat(getComputedStyle(el.parentElement).paddingLeft)}));assert(Math.abs(positions.left-positions.parent-positions.padding)<2);assert.deepEqual(await page.locator('#acknowledgements-view .tool span').allTextContents(),['JavaScript','Canvas 2D','OpenAI Codex','Cloudflare']);const grid=await page.locator('#acknowledgements-view .tools').evaluate(el=>({width:el.getBoundingClientRect().width,parent:el.closest('.acknowledgements-page').getBoundingClientRect().width,columns:getComputedStyle(el).gridTemplateColumns.split(' ').length}));assert(Math.abs(grid.width-grid.parent)<2);assert.equal(grid.columns,4);await evidence(page,'acknowledgements-desktop');await page.goto(base+'/#acknowledgements');await page.locator('#acknowledgements-view').waitFor({state:'visible'});
  for(const route of ['about','home','acknowledgements']){await page.setViewportSize({width:390,height:844});await page.locator('#command').fill(route);await page.keyboard.press('Enter');await page.locator(route==='home'?'.hero':'#'+route+'-view').waitFor({state:'visible'});await checkLayout(page);await evidence(page,route+'-390')}await page.setViewportSize({width:320,height:844});await checkLayout(page);assert.equal(await page.locator('#acknowledgements-view .tools').evaluate(el=>getComputedStyle(el).gridTemplateColumns.split(' ').length),2);await evidence(page,'acknowledgements-320');await page.setViewportSize({width:1280,height:900});
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
