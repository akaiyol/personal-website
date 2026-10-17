"""Render the site's route and state inventory using upstream Python Playwright guidance."""
import argparse,json,os,subprocess
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[3]
p=argparse.ArgumentParser();p.add_argument('--base',required=True);p.add_argument('--out',type=Path,required=True);args=p.parse_args();args.out.mkdir(parents=True,exist_ok=True)
records=[];errors=[]
with sync_playwright() as pw:
    options={'headless':True}
    if os.environ.get('PLAYWRIGHT_CHROMIUM_EXECUTABLE'):options['executable_path']=os.environ['PLAYWRIGHT_CHROMIUM_EXECUTABLE']
    browser=pw.chromium.launch(**options)
    context=browser.new_context(reduced_motion='reduce',permissions=['clipboard-read','clipboard-write'])
    context.tracing.start(screenshots=True,snapshots=True,sources=True)
    page=context.new_page();page.on('pageerror',lambda error:errors.append(str(error)))
    page.on('response',lambda response:errors.append(f'{response.status} {response.url}') if response.status>=400 and response.url.startswith(args.base) else None)
    revision=subprocess.check_output(['git','rev-parse','HEAD'],cwd=ROOT,text=True).strip()
    def capture(name,full=False):
        page.evaluate('document.fonts.ready')
        assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'),f'Overflow: {name}'
        assert page.locator('img:visible').evaluate_all('(images)=>images.every(img=>img.complete&&img.naturalWidth>0)'),f'Broken image: {name}'
        filename=name+'.png';page.screenshot(path=str(args.out/filename),full_page=full)
        records.append({'screen':name,'file':filename,'width':page.viewport_size['width'],'height':page.viewport_size['height'],'url':page.url,'full_page':full,'review':'pending'})
    try:
        doctor=page.request.get(args.base+'/__doctor').json();assert doctor=={'root':str(ROOT),'revision':revision}
        for width,height in [(1470,864),(1280,900),(820,1180),(390,844),(320,740)]:
            page.set_viewport_size({'width':width,'height':height})
            for route,selector in [('home','.hero'),('about','#about-view'),('work','#work-view'),('acknowledgements','#acknowledgements-view'),('connect','#destination-view')]:
                page.goto(args.base+'/#'+route);page.wait_for_load_state('networkidle');page.locator(selector).wait_for(state='visible');page.evaluate('scrollTo(0,0)')
                capture(f'{route}-top-{width}')
                if route!='work':capture(f'{route}-full-{width}',True)
                if route=='home':
                    page.locator('#command').focus();capture(f'terminal-menu-{width}');page.keyboard.press('Escape');page.locator('#command').blur()
                if route=='about':
                    page.wait_for_function('!document.querySelector(".fact-roll").disabled')
                    for name,selector in [('gacha','.fact-machine'),('gallery','.gallery')]:
                        page.locator(selector).scroll_into_view_if_needed();capture(f'about-{name}-{width}')
                    page.get_by_role('button',name='Enlarge Yolanda’s photo',exact=True).click();page.locator('dialog[open]').wait_for();capture(f'character-card-{width}');page.keyboard.press('Escape');page.wait_for_function('!document.querySelector("dialog.photo-zoom").open && !document.activeElement.matches(".memory, .portrait-wink-trigger, .fact-photo-tag")')
                    page.locator('#about-view .memories .memory').first.focus();page.keyboard.press('Enter');page.locator('dialog[open]').wait_for();capture(f'gallery-photo-{width}');page.keyboard.press('Escape');page.wait_for_function('!document.querySelector("dialog.photo-zoom").open && !document.activeElement.matches(".memory, .portrait-wink-trigger, .fact-photo-tag")')
                if route=='work':
                    toggle=page.locator('.stats-toggle')
                    if toggle.get_attribute('aria-expanded')=='false':toggle.click()
                    page.evaluate('scrollTo(0,0)');capture(f'work-stats-{width}')
                    page.locator('.timeline-flowers').scroll_into_view_if_needed()
                    page.wait_for_function('''() => {const c=document.querySelector('#flower-art');if(!Number(c.dataset.frame)||!Number(c.dataset.plants))return false;const pixels=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let ink=0;for(let i=3;i<pixels.length;i+=4)if(pixels[i]&&++ink>100)return true;return false;}''')
                    capture(f'flower-field-{width}')
                    if width in (1470,390):
                        for button in page.locator('.work-filters button').all():
                            button.click();page.evaluate('scrollTo(0,0)');capture(f'filter-{button.inner_text().lower().replace(" ","-")}-{width}')
                        page.locator('.work-filters button').filter(has_text='All').click()
                    if toggle.get_attribute('aria-expanded')=='true':toggle.click()
                    capture(f'work-full-{width}',True)
                if page.evaluate('document.documentElement.scrollHeight>innerHeight+40'):
                    page.evaluate('scrollTo(0,document.documentElement.scrollHeight)');page.wait_for_function('Math.abs(scrollY+innerHeight-document.documentElement.scrollHeight)<3');capture(f'{route}-bottom-{width}')
            page.goto(args.base+'/#projects');page.wait_for_load_state('networkidle');assert page.locator('.hero').is_visible();assert page.title()=='Yolanda | home'
        assert not errors,errors
    except Exception as error:
        errors.append(f'{type(error).__name__}: {error}')
        raise
    finally:
        context.tracing.stop(path=str(args.out/'trace.zip'));context.close();browser.close()
        (args.out/'screens.json').write_text(json.dumps({'revision':revision,'status':'failed' if errors else 'rendered-pending-review','screens':records,'errors':errors,'cleanup':'browser/context closed; server managed by upstream with_server.py'},indent=2))
print(f'Rendered {len(records)} screens; visual review remains required: {args.out}')
