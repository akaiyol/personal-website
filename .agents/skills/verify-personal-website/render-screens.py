"""Render the site's route and state inventory using upstream Python Playwright guidance."""
import argparse,json,os,subprocess
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[3]
p=argparse.ArgumentParser();p.add_argument('--phone',action='store_true');p.add_argument('--base',required=True);p.add_argument('--out',type=Path,required=True);args=p.parse_args();args.out.mkdir(parents=True,exist_ok=True)
records=[];errors=[]
with sync_playwright() as pw:
    options={'headless':True}
    if os.environ.get('PLAYWRIGHT_CHROMIUM_EXECUTABLE'):options['executable_path']=os.environ['PLAYWRIGHT_CHROMIUM_EXECUTABLE']
    browser=pw.chromium.launch(**options)
    context=browser.new_context(reduced_motion='reduce',is_mobile=args.phone,has_touch=args.phone,permissions=['clipboard-read','clipboard-write'])
    context.tracing.start(screenshots=True,snapshots=True,sources=True)
    page=context.new_page();page.on('pageerror',lambda error:errors.append(str(error)))
    page.on('response',lambda response:errors.append(f'{response.status} {response.url}') if response.status>=400 and response.url.startswith(args.base) else None)
    revision=subprocess.check_output(['git','rev-parse','HEAD'],cwd=ROOT,text=True).strip()
    def activate(control):
        if not args.phone:
            control.click();return
        control.scroll_into_view_if_needed()
        page.evaluate('() => new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))')
        target=control.locator('.image').first if control.evaluate("el=>el.matches('.memory')") else control
        point=target.evaluate("""el=>{const r=el.getBoundingClientRect();const cx=r.left+r.width/2,cy=r.top+r.height/2;if(cy>0&&cy<innerHeight&&cx>0&&cx<innerWidth&&el.contains(document.elementFromPoint(cx,cy)))return {x:cx,y:cy};for(let y=3;y<r.height;y+=4)for(let x=3;x<r.width;x+=4){const px=r.left+x,py=r.top+y;if(px<0||px>=innerWidth||py<0||py>=innerHeight)continue;const hit=document.elementFromPoint(px,py);if(hit&&el.contains(hit))return {x:px,y:py};}return null;}""")
        assert point,'No exposed touch target'
        page.touchscreen.tap(point['x'],point['y'])
    def capture(name,full=False):
        page.evaluate('document.fonts.ready')
        assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'),f'Overflow: {name}'
        ready_images = """() => [...document.images].filter(img=>{const r=img.getBoundingClientRect();return r.width&&r.height&&r.bottom>0&&r.top<innerHeight&&r.right>0&&r.left<innerWidth&&getComputedStyle(img).visibility!=="hidden"}).every(img=>img.complete&&img.naturalWidth>0)"""
        if full:
            old_y=page.evaluate('scrollY')
            for y in range(0,page.evaluate('document.documentElement.scrollHeight'),max(200,page.viewport_size['height']-100)):
                page.evaluate('(y)=>scrollTo(0,y)',y);page.wait_for_function(ready_images)
            page.evaluate('(y)=>scrollTo(0,y)',old_y)
        page.wait_for_function(ready_images)
        is_phone=page.evaluate('matchMedia("(max-width:700px), (pointer:coarse) and (max-height:500px)").matches')
        if is_phone:
            assert page.locator('.phone-nav').is_visible(),f'Phone navigation missing: {name}'
            geometry=page.evaluate("""() => {const shell=document.querySelector('.terminal').getBoundingClientRect(),footer=document.querySelector('.terminal>footer').getBoundingClientRect();return Math.abs(shell.left-footer.left)<1&&Math.abs(shell.width-footer.width)<1}""")
            assert geometry,f'Phone footer/shell mismatch: {name}'
            if name.startswith('home-top-') and page.viewport_size['width']>page.viewport_size['height']:
                assert page.locator('.home-actions').evaluate("(el)=>el.getBoundingClientRect().bottom<=document.querySelector('.terminal>footer').getBoundingClientRect().top"),'Landscape Home actions are hidden'
            if name.startswith('work-top-'):
                assert page.locator('.years').is_hidden(),'Phone year navigation should be omitted'
                if page.viewport_size['width']<=430:
                    assert page.locator('.timeline .entry h3').first.evaluate("el=>el.getBoundingClientRect().bottom<document.querySelector('.terminal>footer').getBoundingClientRect().top"),'First employer is hidden below the initial phone viewport'
            if name.startswith('gallery-photo-'):
                assert page.locator('.photo-zoom-close').evaluate('(el)=>{const r=el.getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight}'),'Photo close control outside viewport'
                if page.locator('.photo-song').count():assert page.locator('.photo-song').evaluate('(el)=>el.getBoundingClientRect().bottom<=innerHeight-10'),'Photo details run beyond viewport'
        if full and args.phone and page.viewport_size['width']>page.viewport_size['height']:
            # Full-page capture can expand layout height and deactivate short-screen media queries.
            old_y=page.evaluate('scrollY');total=page.evaluate('document.documentElement.scrollHeight');seen=set()
            for y in range(0,total,max(100,page.viewport_size['height']-160)):
                page.evaluate('(y)=>scrollTo(0,y)',y);page.wait_for_function(ready_images)
                actual=page.evaluate('scrollY')
                if actual in seen:continue
                seen.add(actual)
                assert page.evaluate('matchMedia("(pointer:coarse) and (max-height:500px)").matches'),'Landscape capture changed the viewport media query'
                filename=f'{name}-scroll-{len(seen):02}.png';page.screenshot(path=str(args.out/filename))
                records.append({'screen':name+f'-scroll-{len(seen):02}','file':filename,'width':page.viewport_size['width'],'height':page.viewport_size['height'],'url':page.url,'full_page':False,'scroll_y':actual,'document_height':total,'full_coverage_group':name,'review':'pending'})
            page.evaluate('(y)=>scrollTo(0,y)',old_y)
            return
        filename=name+'.png';page.screenshot(path=str(args.out/filename),full_page=full)
        records.append({'screen':name,'file':filename,'width':page.viewport_size['width'],'height':page.viewport_size['height'],'url':page.url,'full_page':full,'review':'pending'})
        if args.phone and name.startswith('character-card-'):
            assert page.locator('dialog.photo-zoom').evaluate('(el)=>el.scrollWidth<=el.clientWidth+1'),'Character card content is wider than its dialog and is clipped'

    try:
        doctor=page.request.get(args.base+'/__doctor').json();assert doctor=={'root':str(ROOT),'revision':revision}
        if args.phone:
            page.set_viewport_size({'width':390,'height':844});page.goto(args.base+'/#work');page.wait_for_load_state('networkidle')
            def phone_contracts():
                return {'no_phone_stats':page.locator('.stats-toggle').is_hidden(),'no_phone_terminal':page.locator('.command-navigation').is_hidden()}
            positive=phone_contracts();assert all(positive.values()),positive
            page.route('**/phone.css?*',lambda route:route.fulfill(status=200,content_type='text/css',body=''))
            page.reload();page.wait_for_load_state('networkidle');negative=phone_contracts();assert not any(negative.values()),'Regression checks failed to reject missing phone styles'
            page.unroute('**/phone.css?*');page.reload();page.wait_for_load_state('networkidle');assert all(phone_contracts().values())
            (args.out/'regression-proof.json').write_text(json.dumps({'with_phone_styles':positive,'without_phone_styles':negative,'restored':True},indent=2))
        for width,height in ([(320,740),(375,812),(390,844),(430,932),(844,390)] if args.phone else [(1470,864),(1280,900),(820,1180),(390,844),(320,740)]):
            page.set_viewport_size({'width':width,'height':height})
            for route,selector in [('home','.hero'),('about','#about-view'),('work','#work-view'),('acknowledgements','#acknowledgements-view'),('connect','#destination-view')]:
                page.goto(args.base+'/#'+route);page.wait_for_load_state('networkidle');page.locator(selector).wait_for(state='visible');page.evaluate('scrollTo(0,0)')
                capture(f'{route}-top-{width}')
                if route!='work':capture(f'{route}-full-{width}',True)
                if route=='home':
                    if page.locator('.phone-nav').is_visible():activate(page.locator('.phone-menu-toggle'));capture(f'phone-menu-{width}');page.keyboard.press('Escape')
                    else:page.locator('#command').focus();capture(f'terminal-menu-{width}');page.keyboard.press('Escape');page.locator('#command').blur()
                if route=='about':
                    page.wait_for_function('!document.querySelector(".fact-roll").disabled')
                    for name,selector in [('gacha','.fact-machine'),('gallery','.gallery')]:
                        page.locator(selector).scroll_into_view_if_needed();capture(f'about-{name}-{width}')
                    if page.locator('.phone-gallery-toggle').is_visible():activate(page.locator('.phone-gallery-toggle'));page.locator('.memories>.memory').last.scroll_into_view_if_needed();capture(f'gallery-expanded-{width}')
                    activate(page.get_by_role('button',name='Enlarge Yolanda’s photo',exact=True));page.locator('dialog[open]').wait_for();capture(f'character-card-{width}');activate(page.get_by_role('button',name='Close enlarged photo',exact=True));page.wait_for_function('!document.querySelector("dialog.photo-zoom").open && !document.activeElement.matches(".memory, .portrait-wink-trigger, .fact-photo-tag")')
                    activate(page.locator('#about-view .memories .memory').first);page.locator('dialog[open]').wait_for();capture(f'gallery-photo-{width}');activate(page.get_by_role('button',name='Close enlarged photo',exact=True));page.wait_for_function('!document.querySelector("dialog.photo-zoom").open && !document.activeElement.matches(".memory, .portrait-wink-trigger, .fact-photo-tag")')
                if route=='work':
                    toggle=page.locator('.stats-toggle')
                    if toggle.is_visible():
                        if toggle.get_attribute('aria-expanded')=='false':activate(toggle)
                        page.evaluate('scrollTo(0,0)');capture(f'work-stats-{width}')
                    else:
                        assert page.locator('#work-stats').is_hidden()
                        assert page.locator('.work-filters').is_hidden()
                        assert page.locator('#work-view .entry:visible').count()==7
                    page.locator('.timeline-flowers').scroll_into_view_if_needed()
                    page.wait_for_function('''() => {const c=document.querySelector('#flower-art');if(!Number(c.dataset.frame)||!Number(c.dataset.plants))return false;const pixels=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let ink=0;for(let i=3;i<pixels.length;i+=4)if(pixels[i]&&++ink>100)return true;return false;}''')
                    capture(f'flower-field-{width}')
                    if page.locator('.work-filters').is_visible() and width in (1470,390):
                        for button in page.locator('.work-filters button').all():
                            activate(button);page.evaluate('scrollTo(0,0)');capture(f'filter-{button.inner_text().lower().replace(" ","-")}-{width}')
                        activate(page.locator('.work-filters button').filter(has_text='All'))
                    if toggle.get_attribute('aria-expanded')=='true':activate(toggle)
                    capture(f'work-full-{width}',True)
                if page.evaluate('document.documentElement.scrollHeight>innerHeight+40'):
                    page.evaluate('scrollTo(0,document.documentElement.scrollHeight)');page.wait_for_function('Math.abs(scrollY+innerHeight-document.documentElement.scrollHeight)<3');capture(f'{route}-bottom-{width}')
            page.goto(args.base+'/#projects');page.wait_for_load_state('networkidle');assert page.locator('.hero').is_visible();assert page.title()=='Yolanda | home'
        if args.phone:
            page.set_viewport_size({'width':1280,'height':900});page.goto(args.base+'/#work');page.wait_for_load_state('networkidle')
            activate(page.locator('.stats-toggle'));page.goto(args.base+'/#home');page.wait_for_load_state('networkidle')
            page.set_viewport_size({'width':390,'height':844});assert not page.locator('.stats-dialog').evaluate('e=>e.open')
            activate(page.locator('.phone-nav a[href="#about"]'));page.locator('#about-view').wait_for(state='visible');capture('phone-navigation-after-desktop-stats')
            page.goto(args.base+'/#about');page.wait_for_load_state('networkidle');activate(page.locator('#about-view .memories .memory').first);page.locator('dialog[open]').wait_for()
            page.set_viewport_size({'width':844,'height':390});page.wait_for_function('document.querySelector(".photo-song").getBoundingClientRect().bottom<innerHeight-10');capture('phone-photo-after-rotation')
            activate(page.get_by_role('button',name='Close enlarged photo',exact=True));page.wait_for_function('!document.querySelector("dialog.photo-zoom").open')
        assert not errors,errors
    except Exception as error:
        errors.append(f'{type(error).__name__}: {error}')
        raise
    finally:
        context.tracing.stop(path=str(args.out/'trace.zip'));context.close();browser.close()
        (args.out/'screens.json').write_text(json.dumps({'revision':revision,'status':'failed' if errors else 'rendered-pending-review','screens':records,'errors':errors,'cleanup':'browser/context closed; server managed by upstream with_server.py'},indent=2))
print(f'Rendered {len(records)} screens; visual review remains required: {args.out}')
