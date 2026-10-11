from pathlib import Path
from xml.sax.saxutils import escape
root=Path(__file__).resolve().parents[1]
rows='''..............####.....
............#######....
............##....#....
......######.......#...
.....#..............#..
....#...............#..
...#......#.#........#.
.##.......#.#......#.#.
.##...##........#.###.#
.##.............#.###.#
...#...........#.####.#
....#..........#.####.#
..#####........#.###.##
.#RRRR###.......#...#..
.#RRRRRRR###..########.
.#RRRRRRR#RR##RRRRRRRR#
#RRRR#####RR#RRRRRRRRR#
#RRRRRRRR#RR####RRRRRR#
#RRRRRRR#.###RRR#RRRR#.
.#######.....#RRRRRRR#.
......#.....#.#RRRRRRR#.
......#.....#..###RRR#.
......#.....#..#..###..
......#.....#.###......
.......##....###.#.....
.........#.#..#.##.....
.....#####.#..#........
....#..#.......#.......
....#.#........#.......
....###########........'''.splitlines()
# Rebuild the design as a vector pixel grid. Dots between boundary pixels
# are opaque white; dots outside each scanline remain transparent.
def pixels(data,start=0, eyes=False):
 out=[]
 for yy,line in enumerate(data,start):
  occupied=[i for i,v in enumerate(line) if v!='.']
  if not occupied: continue
  for x in range(min(occupied),max(occupied)+1):
   ch=line[x]
   if eyes and (x,yy) in {(10,6),(10,7),(12,6),(12,7),(6,8),(7,8)}: ch='.'
   color={'#':'#161416','R':'#d91d42','.':'#fffdf9'}[ch]
   out.append(f'<rect x="{x}" y="{yy}" width="1" height="1" fill="{color}"/>')
 return ''.join(out)
# Each frame contains exactly two connected leg shapes. The reference's
# original lower body is replaced completely, never layered over the gait.
from math import hypot, cos, sin, radians

def limb(hip,foot):
    # Match the reference: one full-grid pixel for fills and outlines.
    # One short shin joins one paw; no knee or extra foot is synthesized.
    ax,ay,tilt=foot
    angle=radians(tilt)
    cells=set()
    step=1
    for iy in range(22,33):
        for ix in range(1,19):
            x,y=ix*step+.5,iy*step+.5
            dx,dy=ax-hip[0],ay-.35-hip[1]
            t=max(0,min(1,((x-hip[0])*dx+(y-hip[1])*dy)/(dx*dx+dy*dy)))
            shin=hypot(x-hip[0]-t*dx,y-hip[1]-t*dy)<.9
            fx,fy=x-(ax-1.25),y-ay
            rx,ry=fx*cos(angle)+fy*sin(angle),-fx*sin(angle)+fy*cos(angle)
            paw=(rx/3.6)**2+(ry/1.65)**2<=1
            if shin or paw: cells.add((ix,iy))
    out=[]
    for ix,iy in sorted(cells):
        edge=any((ix+dx,iy+dy) not in cells for dx,dy in [(1,0),(-1,0),(0,1),(0,-1)])
        out.append(f'<rect x="{ix}" y="{iy}" width="1" height="1" fill="{"#161416" if edge else "#fffdf9"}"/>')
    return ''.join(out)

# Contact, recoil, passing, and reach; the second half swaps supporting feet.
# Foot coordinates are x, y, angle. Flat contacts share the same ground line.
walk=[((8,28,0),(13,27.5,-12)),((9,28,0),(12.5,26.8,-18)),((10,28,0),(11,26.3,-22)),((11.5,28,0),(8.5,27.1,18)),((13,27.5,-12),(8,28,0)),((12.5,26.8,-18),(9,28,0)),((11,26.3,-22),(10,28,0)),((8.5,27.1,18),(11.5,28,0))]
skip=[((8,28,0),(12.5,26.2,-25)),((9,27.8,-5),(12,25.8,-30)),((10,27.3,-12),(12,25.6,-35)),((11.5,27.2,-10),(9,26.4,20)),((12.5,26.2,-25),(8,28,0)),((12,25.8,-30),(9,27.8,-5)),((12,25.6,-35),(10,27.3,-12)),((9,26.4,20),(11.5,27.2,-10))]
torso=rows[20:23]+['......#......#.........','.......#.....#.........']

def make_svg(mode,poses):
    # Every pose is a whole scene selected by discrete visibility, with
    # a large happy-eye gap and separate leg roots at x=9 and x=12.
    duration='.88s' if mode=='walking' else '1.04s'
    styles=[]
    for i in range(8):
        start=i*12.5; end=(i+1)*12.5
        if i==0: key='0%,12.499%{opacity:1}12.5%,100%{opacity:0}'
        else: key=f'0%,{start-.001}%{{opacity:0}}{start}%,{end-.001}%{{opacity:1}}{end}%,100%{{opacity:0}}' if i<7 else '0%,87.499%{opacity:0}87.5%,100%{opacity:1}'
        styles.append(f'@keyframes frame{i}{{{key}}}.frame{i}{{opacity:0;animation:frame{i} {duration} steps(1,end) infinite}}')
    styles.append('@keyframes neutral{0%,54.999%{opacity:1}55%,100%{opacity:0}}@keyframes happy{0%,54.999%{opacity:0}55%,100%{opacity:1}}.eyes-neutral{animation:neutral 3.2s steps(1,end) infinite}.eyes-happy{opacity:0;animation:happy 3.2s steps(1,end) infinite}@media(prefers-reduced-motion:reduce){.pose,.eyes-neutral,.eyes-happy{animation:none!important}.pose{opacity:0!important}.frame0,.eyes-neutral{opacity:1!important}.eyes-happy{opacity:0!important}}')
    svg=f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="-3 -6 29 40" width="290" height="400" shape-rendering="crispEdges" role="img" aria-labelledby="title desc"><title id="title">Snoopy {mode}</title><desc id="desc">Two-legged pixel-art {mode} cycle with original and happy caret eyes.</desc><style>{"".join(styles)}</style>'
    for i,(a1,a2) in enumerate(poses):
        bob=([0,-1,-3,-2,0,-1,-3,-2] if mode=='skipping' else [0,0,-1,0,0,0,-1,0])[i]
        lift=bob if mode=='skipping' else 0
        body_bob=0 if mode=='skipping' else bob
        svg+=f'<g class="pose frame{i}" transform="translate(0 {lift})">'+limb((11.5,23+body_bob),a2)+limb((9.5,23+body_bob),a1)+f'<g transform="translate(0 {body_bob})">'+pixels(rows[:20],eyes=True)+pixels(torso,20)+'<path fill="#161416" d="M6 20h2v3H5v-2h1z M12 20h2v1h1v2h-2v-1h-1z"/><path fill="#fffdf9" d="M6 21h1v1H6z M13 21h1v1h-1z"/>'
        svg+='<g fill="#161416" class="eyes-neutral"><path d="M10 6h1v2h-1z M12 6h1v2h-1z"/></g><g fill="#161416" class="eyes-happy"><path d="M8 7h1V6h1v1h1v1h-1V7H9v1H8z M13 7h1V6h1v1h1v1h-1V7h-1v1h-1z"/></g></g></g>'
    return svg+'</svg>'

for mode,poses in [('walking',walk),('skipping',skip)]:
    (root/f'assets/avatar/snoopy-{mode}.svg').write_text(make_svg(mode,poses))

html='''<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Snoopy avatar comparison</title><style>*{box-sizing:border-box}body{margin:0;background:#101014;color:#eae6f2;font:14px/1.6 Menlo,monospace}main{max-width:960px;margin:auto;padding:32px 24px}h1{font-size:20px;font-weight:400}h2{font-size:16px;font-weight:400;margin:0 0 12px}p{color:#bcb7c7}.comparison{display:grid;grid-template-columns:1fr 1fr;gap:20px}.stage{display:grid;place-items:center;min-height:420px;border:1px solid #44404d;border-radius:8px;background:#f4f1f7}.stage svg{width:261px;height:360px;max-width:100%;image-rendering:pixelated}.dark .stage{background:#24212d}.controls{display:flex;gap:12px;flex-wrap:wrap;margin:20px 0}button{font:inherit;color:inherit;background:transparent;border:1px solid #77707e;border-radius:4px;padding:9px 14px;min-height:44px;cursor:pointer}button:focus-visible{outline:2px solid #c5b5ec;outline-offset:4px}.paused *{animation-play-state:paused!important}.small .stage svg{width:116px;height:160px}a{color:#c5b5ec}.scrubber{display:flex;align-items:center;gap:12px;flex-wrap:wrap}input{accent-color:#c5b5ec}body.scrubbing .pose,body.scrubbing .eyes-neutral,body.scrubbing .eyes-happy{animation:none!important}body.scrubbing .pose{opacity:0!important}body.scrubbing .pose.selected{opacity:1!important}body.scrubbing .eyes-neutral{opacity:0!important}body.scrubbing .eyes-happy{opacity:1!important}@media(max-width:600px){.comparison{grid-template-columns:1fr}.stage{min-height:370px}}</style><main><h1>Snoopy avatar</h1><p>Uniform pixel outlines · alternating ^^ eyes</p><div class="controls"><button id="pause" aria-pressed="false">Pause</button><button id="background" aria-pressed="false">Dark background</button><button id="size" aria-pressed="false">Actual avatar size</button></div><div class="comparison">'''
for mode,poses in [('walking',walk),('skipping',skip)]:
    # Namespace keyframes per inline SVG to avoid cross-animation collisions.
    svg=make_svg(mode,poses)
    for i in range(8): svg=svg.replace('frame'+str(i),mode+'frame'+str(i))
    svg=svg.replace('<title id="title">',f'<title id="{mode}-title">').replace('<desc id="desc">',f'<desc id="{mode}-desc">').replace('aria-labelledby="title desc"',f'aria-labelledby="{mode}-title {mode}-desc"')
    html+=f'<section><h2>{mode.capitalize()}</h2><div class="stage">{svg}</div><p><a href="snoopy-{mode}.svg" download>Download {mode} SVG</a></p></section>'
html+='''</div><div class="scrubber"><label for="frame">Inspect pose</label><input id="frame" type="range" min="0" max="7" value="0"><output id="frame-label">1 / 8</output><button id="resume">Resume animation</button></div></main><script>for(const [id,cls,off,on] of [['pause','paused','Pause','Play'],['background','dark','Dark background','Light background'],['size','small','Actual avatar size','Large preview']]){document.getElementById(id).onclick=e=>{const active=document.body.classList.toggle(cls);e.target.setAttribute('aria-pressed',String(active));e.target.textContent=active?on:off;};}document.querySelector('#frame').oninput=e=>{document.body.classList.add('scrubbing');document.querySelectorAll('.pose').forEach(p=>p.classList.toggle('selected',p.classList.contains('walkingframe'+e.target.value)||p.classList.contains('skippingframe'+e.target.value)));document.querySelector('#frame-label').textContent=(Number(e.target.value)+1)+' / 8';};document.querySelector('#resume').onclick=()=>document.body.classList.remove('scrubbing');</script></html>'''
(root/'assets/avatar/preview.html').write_text(html)
print('Built walking and skipping SVGs with eight poses each.')
