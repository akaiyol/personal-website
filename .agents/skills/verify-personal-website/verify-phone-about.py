"""Canonical website phone regression checks. Controlled entropy affects only disposable test contexts."""
from pathlib import Path
import argparse,json,os,subprocess
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[3]
parser=argparse.ArgumentParser(description='Drive phone About layouts, photos, touch scroll and normal/jackpot gacha paths.')
parser.add_argument('--base',required=True)
parser.add_argument('--out',required=True,type=Path)
args=parser.parse_args();out=args.out;out.mkdir(parents=True,exist_ok=True)
revision=subprocess.check_output(['git','rev-parse','HEAD'],cwd=ROOT,text=True).strip()
records=[]
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path=os.environ.get('PLAYWRIGHT_CHROMIUM_EXECUTABLE'),headless=True)
 try:
  for width,height,touch in [(320,740,True),(375,812,True),(390,844,True),(430,932,True),(844,390,True),(1470,864,False)]:
   context=browser.new_context(viewport={'width':width,'height':height},has_touch=touch,is_mobile=touch)
   context.add_init_script("let queue=[99,18,0,0,0];crypto.getRandomValues=(a)=>{a[0]=queue.length?queue.shift():99;return a}")
   page=context.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)));page.goto(args.base+'/#about');page.wait_for_load_state('networkidle');assert page.request.get(args.base+'/__doctor').json()=={'root':str(ROOT),'revision':revision};page.wait_for_function('!document.querySelector(".fact-roll").disabled')
   machine=page.locator('.fact-machine');machine.scroll_into_view_if_needed();page.evaluate('scrollBy(0,document.querySelector(".fact-machine").getBoundingClientRect().top-50)');page.screenshot(path=str(out/f'gacha-{width}-settled.png'))
   tag=page.get_by_role('button',name='Open photo for #gundam',exact=True);tag.click();page.locator('dialog.photo-zoom').wait_for(state='visible');page.get_by_role('button',name='Close enlarged photo',exact=True).click();page.wait_for_function('!document.querySelector("dialog.photo-zoom").open')
   button=page.locator('.fact-roll');button.scroll_into_view_if_needed();before=button.bounding_box();button.click();assert page.locator('.fact-results').get_attribute('aria-busy')=='true';busy=button.bounding_box();assert abs(before['y']-busy['y'])<1,(width,'roll jumped during animation',before,busy)
   if width==390:
    for i,delay in enumerate([200,500,700,650]):
     page.wait_for_timeout(delay);page.screenshot(path=str(out/f'gacha-motion-{i}.png'))
   page.wait_for_function('!document.querySelector(".fact-roll").disabled');after=button.bounding_box();assert abs(before['y']-after['y'])<1,(width,'roll jumped after animation',before,after,page.locator('.fact-machine').evaluate('el=>({rows:getComputedStyle(el).gridTemplateRows,scrollY,labels:[...el.querySelectorAll(".fact-results p")].map(p=>({text:p.innerText,height:p.getBoundingClientRect().height}))})'));assert page.locator('.fact-results p').count()==4
   page.locator('#about-title').click();page.keyboard.press('1');page.wait_for_function('document.querySelector(".fact-roll").disabled');page.wait_for_function('!document.querySelector(".fact-roll").disabled')
   photos=page.locator('#about-view .memories>.memory');assert photos.count()==8
   if touch:page.locator('.phone-gallery-toggle').click()
   for i in range(8):
    photo=photos.nth(i);photo.scroll_into_view_if_needed();photo.locator('img').evaluate('el=>el.decode()');page.mouse.move(5,5);page.screenshot(path=str(out/f'gallery-{width}-{i}.png'))
    if touch:
     r=photo.locator('.image').first.bounding_box();page.touchscreen.tap(r['x']+r['width']/2,r['y']+r['height']/2)
    else: photo.click()
    page.locator('dialog.photo-zoom').wait_for(state='visible');page.screenshot(path=str(out/f'photo-{width}-{i}.png'));page.get_by_role('button',name='Close enlarged photo',exact=True).click();page.wait_for_function('!document.querySelector("dialog.photo-zoom").open&&!document.activeElement.matches(".memory,.fact-photo-tag")')
   if touch:
    photos.first.scroll_into_view_if_needed();r=photos.first.bounding_box();x=r['x']+r['width']/2;y=min(r['y']+r['height']/2,height-120);old=page.evaluate('scrollY');cdp=context.new_cdp_session(page)
    cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':x,'y':y}]})
    for step in range(1,9):
     cdp.send('Input.dispatchTouchEvent',{'type':'touchMove','touchPoints':[{'x':x,'y':y-step*15}]});page.wait_for_timeout(20)
    cdp.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]});page.wait_for_timeout(200);assert page.evaluate('scrollY')>old+30,(width,'photo swipe did not scroll page');assert page.locator('.memory.dragging').count()==0;assert not page.locator('dialog.photo-zoom').is_visible();cdp.detach()
    # Rotation must restore the desktop rail and retain the phone column on return.
    page.set_viewport_size({'width':1280,'height':900});assert photos.first.evaluate('el=>getComputedStyle(el).position')=='absolute';page.set_viewport_size({'width':width,'height':height});assert photos.first.evaluate('el=>getComputedStyle(el).position')=='relative'
   page.emulate_media(reduced_motion='reduce');button.click();assert not button.is_disabled();assert page.locator('.fact-track').evaluate_all('els=>els.every(e=>e.children.length===1&&!e.style.transform)')
   assert not errors,errors;records.append({'viewport':[width,height],'all_photos':8,'conditional_photo':'passed','roll_position_stable':True,'motion_and_reduced_motion':'passed','touch_swipe':touch});context.close()
  # Controlled entropy exercises the real rare-jackpot path at phone sizes.
  for width in [320,390]:
   context=browser.new_context(viewport={'width':width,'height':844},has_touch=True,is_mobile=True,reduced_motion='reduce');context.add_init_script('crypto.getRandomValues=(a)=>{a[0]=0;return a}');page=context.new_page();page.goto(args.base+'/#about');page.wait_for_load_state('networkidle');assert page.locator('.fact-results .jackpot').inner_text()=='labubu';assert page.locator('.fact-track .braille-star').count()==4;page.locator('.fact-machine').scroll_into_view_if_needed();page.evaluate('scrollBy(0,document.querySelector(".fact-machine").getBoundingClientRect().top-40)');page.screenshot(path=str(out/f'jackpot-{width}.png'));assert page.evaluate('document.documentElement.scrollWidth<=innerWidth');context.close()
 finally:browser.close()
(out/'results.json').write_text(json.dumps({'revision':revision,'cases':records,'cleanup':'browser closed; server owned by upstream helper'},indent=2));print('Passed phone/desktop photo, scrolling, roll, layout, jackpot and reduced-motion checks.')
