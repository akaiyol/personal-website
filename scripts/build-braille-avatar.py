"""Render the editable avatar poses as native Unicode Braille in site purple."""
from pathlib import Path
import re
import runpy
import xml.etree.ElementTree as ET

ROOT=Path(__file__).resolve().parents[1]
source=runpy.run_path(str(ROOT/'scripts/build-snoopy-avatar.py'))
NS='{http://www.w3.org/2000/svg}'
SCALE=2
X0,Y0=-3,-6
WIDTH,HEIGHT=58,80
BITS=((0,0,1),(0,1,2),(0,2,4),(1,0,8),(1,1,16),(1,2,32),(0,3,64),(1,3,128))

def polygon(d):
    tokens=re.findall(r'[MmHhVvZz]|-?\d+(?:\.\d+)?',d)
    points=[]; contours=[]; x=y=0; i=0; cmd=None
    while i<len(tokens):
        if tokens[i].isalpha():
            cmd=tokens[i];i+=1
            if cmd.lower()=='z':
                contours.append(points);points=[];continue
        if cmd in ('M','m'):
            a,b=float(tokens[i]),float(tokens[i+1]);i+=2
            x,y=(a,b) if cmd=='M' else (x+a,y+b)
        elif cmd in ('h','H'):
            a=float(tokens[i]);i+=1;x=a if cmd=='H' else x+a
        elif cmd in ('v','V'):
            a=float(tokens[i]);i+=1;y=a if cmd=='V' else y+a
        else: raise ValueError(d)
        points.append((x,y))
    if points:contours.append(points)
    return contours

def inside(x,y,points):
    hit=False
    for a,b in zip(points,points[1:]+points[:1]):
        if (a[1]>y)!=(b[1]>y) and x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0]:hit=not hit
    return hit

def render(pose,expression):
    grid=[[0]*WIDTH for _ in range(HEIGHT)]
    def paint(el,tx=0,ty=0,fill=None):
        cls=el.get('class','')
        if cls.startswith('eyes-') and cls!='eyes-'+expression:return
        transform=el.get('transform','')
        match=re.search(r'translate\(([-.\d]+)[ ,]+([-.\d]+)\)',transform)
        if match:tx+=float(match[1]);ty+=float(match[2])
        fill=el.get('fill',fill)
        tag=el.tag.removeprefix(NS)
        if tag in ('rect','path'):
            if tag=='rect':
                x,y,w,h=[float(el.get(k)) for k in ('x','y','width','height')]
                contours=[[(x,y),(x+w,y),(x+w,y+h),(x,y+h)]]
            else:contours=polygon(el.get('d'))
            for poly in contours:
                lo_x=max(0,int((min(p[0] for p in poly)+tx-X0)*SCALE))
                hi_x=min(WIDTH,int((max(p[0] for p in poly)+tx-X0)*SCALE+1))
                lo_y=max(0,int((min(p[1] for p in poly)+ty-Y0)*SCALE))
                hi_y=min(HEIGHT,int((max(p[1] for p in poly)+ty-Y0)*SCALE+1))
                for gy in range(lo_y,hi_y):
                    for gx in range(lo_x,hi_x):
                        if inside(X0+(gx+.5)/SCALE-tx,Y0+(gy+.5)/SCALE-ty,poly):
                            # Ink forms the outline. The bow has a sparse dot
                            # fill; white paper becomes the black background.
                            grid[gy][gx]=int(fill=='#161416' or (fill=='#d91d42' and (gx+gy)%3==0))
        for child in el:paint(child,tx,ty,fill)
    paint(pose)
    lines=[]
    for y in range(0,HEIGHT,4):
        chars=[]
        for x in range(0,WIDTH,2):
            code=sum(bit for dx,dy,bit in BITS if grid[y+dy][x+dx])
            chars.append(chr(0x2800+code))
        lines.append(''.join(chars))
    return ''.join(f'<text x="{X0}" y="{Y0+j*2+1.66}" textLength="29" lengthAdjust="spacingAndGlyphs">{line}</text>' for j,line in enumerate(lines))

outputs=[]
for mode in ('walking',):
    original=ET.parse(ROOT/f'assets/avatar/snoopy-{mode}.svg').getroot()
    style=original.find(NS+'style').text
    svg=f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="-3 -6 29 40" width="290" height="400" role="img" aria-labelledby="title desc"><title id="title">Braille Snoopy {mode}</title><desc id="desc">Purple Braille line art on black, with alternating original and happy eyes.</desc><style>{style}text{{font-family:Menlo,Consolas,monospace;font-size:2.2px;fill:#c5b5ec;white-space:pre}}</style>'
    for i,pose in enumerate(original.findall(NS+'g')):
        svg+=f'<g class="pose frame{i}"><g class="eyes-neutral">{render(pose,"neutral")}</g><g class="eyes-happy">{render(pose,"happy")}</g></g>'
    svg+='</svg>'
    (ROOT/f'assets/avatar/snoopy-{mode}-braille.svg').write_text(svg)
    for i in range(8):svg=svg.replace('frame'+str(i),mode+'frame'+str(i))
    svg=svg.replace('id="title"',f'id="{mode}-title"').replace('id="desc"',f'id="{mode}-desc"').replace('aria-labelledby="title desc"',f'aria-labelledby="{mode}-title {mode}-desc"')
    outputs.append(svg)

# Draw separate turn and airborne poses for the hover greeting.
front_rows=[
'...#####.....#####.....',
'..#RRRRR#...#RRRRR#....',
'..#RRRRRR###RRRRRR#....',
'..#RRRRRR#R#RRRRRR#....',
'...#RRRRR###RRRRR#.....',
'...######...######.....',
'.......#.....#.........',
'......##.....##........',
'.....#.#.....#.#.......',
'.....#.#.....#.#.......',
'......##.....##........',
'.......#.....#.........',
'.......##...##.........',
'.......#.#.#.#.........',
'......#..#.#..#........',
'.....#...#.#...#.......',
'.....#####.#####.......',
]
quarter_rows=front_rows.copy()
quarter_rows[7:13]=[
'.......#....##.........',
'......##....#.#........',
'......#.#...#.#........',
'.......##...##.........',
'........#...#..........',
'........#...##.........',
]
# Airborne pose follows the supplied Snoopy reference: open arms, splayed
# legs, and large outward-facing feet.
jump_rows=front_rows[:6]+[
'.##....#.....#....##...',
'#..#####.....#####..#..',
'#......#.....#......#..',
'.######.......######...',
'.......#.....#.........',
'......#.......#........',
'.....#...###...#.......',
'..###...#...#...###....',
'.#.#....#...#....#.#...',
'.#......#...#......#...',
'..#.....#...#.....#....',
'...#####.....#####.....',
]
head=source['pixels'](source['rows'][:13],eyes=True)
happy='<path fill="#161416" d="M8 7h1V6h1v1h1v1h-1V7H9v1H8z M13 7h1V6h1v1h1v1h-1V7h-1v1h-1z"/>'
def jumping_head():
    # Nose lifted, ears flared to either side, and an upturned smile,
    # following the user's supplied jumping reference.
    outline=[(7,0),(11,0),(13,1),(14,3),(15,4),(17,5),(18,7),(17,10),(15,12),(13,13),(9,13),(9,12),(7,10),(5,8),(4,5),(5,2),(6,1)]
    ears=[[(5,5),(3,3),(1,4),(0,6),(1,8),(3,9),(7,9)],[(16,7),(19,7),(22,4),(24,4),(25,6),(24,9),(22,10),(19,10),(17,9)]]
    grid={}
    for poly in ears:
        for iy in range(-2,28):
            for ix in range(0,52):
                if inside(ix*.5+.25,iy*.5+.25,poly):grid[ix,iy]='#161416'
    cells={(ix,iy) for iy in range(-2,28) for ix in range(0,52) if inside(ix*.5+.25,iy*.5+.25,outline)}
    for ix,iy in cells:
        edge=any((ix+dx,iy+dy) not in cells for dx,dy in [(2,0),(-2,0),(0,2),(0,-2)])
        grid[ix,iy]='#161416' if edge else '#fffdf9'
    for iy in range(-2,24):
        for ix in range(8,36):
            x,y=ix*.5+.25,iy*.5+.25
            nose=((x-7.5)/1.7)**2+((y-.3)/1.1)**2<=1
            # One closed happy eye in this tilted three-quarter view.
            eye=inside(x,y,[(13,5),(14,4),(15,5),(15,6),(14,5),(13,6)])
            smile=inside(x,y,[(6.5,8),(7.5,8),(8,9),(10,10),(12,10),(14,9),(15,8),(15.5,8.5),(14.5,10),(12,11),(9.5,11),(7,9.5)])
            if nose or eye or smile:grid[ix,iy]='#161416'
    return ''.join(f'<rect x="{ix*.5}" y="{iy*.5}" width=".5" height=".5" fill="{fill}"/>' for (ix,iy),fill in sorted(grid.items()))

jump_head=jumping_head()
reaction='<svg xmlns="http://www.w3.org/2000/svg" class="snoopy-turn" viewBox="-3 -6 29 40" aria-hidden="true"><style>text{font-family:Menlo,Consolas,monospace;font-size:2.2px;fill:#c5b5ec;white-space:pre}</style>'
for name,body in [('quarter',quarter_rows),('front',front_rows),('jump',jump_rows)]:
    face=jump_head if name=='jump' else head
    expression='' if name=='jump' else happy
    pose=ET.fromstring('<g>'+face+source['pixels'](body,13)+expression+'</g>')
    reaction+=f'<g class="turn-{name}">{render(pose,"happy")}</g>'
reaction+='</svg>'

(ROOT/'assets/avatar/snoopy-avatar.html').write_text('<span class="snoopy-motion">'+outputs[0]+reaction+'</span>')
preview=ROOT/'assets/avatar/preview.html'
html="""<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Snoopy avatar</title><link rel="stylesheet" href="snoopy-avatar.css"><style>*{box-sizing:border-box}body{margin:0;background:#000;color:#c5b5ec;font:14px/1.6 Menlo,monospace;min-height:100svh;display:grid;place-items:center}main{width:min(680px,100%);padding:32px 24px}h1{font-size:20px;font-weight:400}p{font-size:13px}.stage{display:grid;place-items:center;min-height:460px;border:1px solid #342b44;border-radius:8px}.controls{display:flex;gap:12px;margin-top:20px;align-items:center;flex-wrap:wrap}.controls button{font:inherit;background:none;color:inherit;border:1px solid #74658c;border-radius:4px;padding:9px 14px;min-height:44px;cursor:pointer}a{color:inherit}button:focus-visible{outline:2px dashed #c5b5ec;outline-offset:5px}.small .snoopy-avatar{width:174px;height:240px}@media(max-width:500px){.stage{min-height:400px}}</style><main><h1>Snoopy avatar</h1><p>Hover, tap, or focus to say hello.</p><div class="stage"><button class="snoopy-avatar" data-snoopy-avatar aria-label="Say hello to Snoopy"><span class="snoopy-motion">"""+outputs[0]+reaction+"""</span></button></div><div class="controls"><button id="pause" aria-pressed="false">Pause walking</button><button id="size" aria-pressed="false">Sidebar size</button><button id="inspect" aria-pressed="false">Inspect jump pose</button><a href="snoopy-walking-braille.svg" download>Download SVG</a></div></main><script src="snoopy-avatar.js"></script><script>const avatar=document.querySelector('[data-snoopy-avatar]');document.querySelector('#pause').onclick=e=>{const active=avatar.classList.toggle('is-paused');e.target.setAttribute('aria-pressed',String(active));e.target.textContent=active?'Resume walking':'Pause walking';};document.querySelector('#inspect').onclick=e=>{const active=avatar.classList.toggle('is-inspecting');e.target.setAttribute('aria-pressed',String(active));e.target.textContent=active?'Resume animation':'Inspect jump pose';};document.querySelector('#size').onclick=e=>{const active=document.body.classList.toggle('small');e.target.setAttribute('aria-pressed',String(active));e.target.textContent=active?'Large preview':'Sidebar size';};</script></html>"""
preview.write_text(html)
print('Built purple Braille walking avatar and hover preview.')
