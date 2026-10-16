"""Build the portfolio's editable six-trait radar draft."""
from pathlib import Path
import math
ROOT=Path(__file__).resolve().parents[1]
# Grades are calibration references only; the rendered graph has no scores.
traits=[('Strategy',.70),('Engineering',.94),('Design',.50),('Curiosity',.94),('Execution',.825),('Taste',1.0)]
W,H=600,530
cx,cy,r=300,255,165
angles=[-math.pi/2+i*2*math.pi/len(traits) for i in range(len(traits))]
def point(i,scale):return (cx+r*scale*math.cos(angles[i]),cy+r*scale*math.sin(angles[i]))
def polygon(scale):return [point(i,scale) for i in range(len(traits))]
def edges(points,close=True):return list(zip(points,points[1:]+points[:1])) if close else [(points[0],points[1])]
def lines(segments,color,opacity,width=1):
    path=' '.join(f'M{x1:.2f},{y1:.2f} L{x2:.2f},{y2:.2f}' for (x1,y1),(x2,y2) in segments)
    return f'<path d="{path}" fill="none" stroke="{color}" stroke-opacity="{opacity}" stroke-width="{width}" stroke-linejoin="round" stroke-linecap="round"/>'
values=[point(i,value) for i,(_,value) in enumerate(traits)]
svg=['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 530" role="img" aria-labelledby="title desc"><title id="title">Personal strengths</title><desc id="desc">Six traits: Strategy, Engineering, Design, Curiosity, Execution, and Taste. Taste extends furthest, followed by Engineering and Curiosity, then Execution, Strategy and Design.</desc><style>.label{font:15px Menlo,Consolas,monospace;fill:#c5b5ec}</style>']
svg.append('<polygon points="'+' '.join(f'{x:.2f},{y:.2f}' for x,y in values)+'" fill="#9874cf" fill-opacity=".40"/>')
svg.append(lines(sum((edges(polygon(s)) for s in [.25,.5,.75,1]),[]),'#c5b5ec',.40))
svg.append(lines([((cx,cy),point(i,1)) for i in range(len(traits))],'#c5b5ec',.28))
svg.append(lines(edges(values),'#d8c7ff',1,2))
for i,(name,_) in enumerate(traits):
    x,y=point(i,1.23)
    anchor='middle' if i in (0,3) else ('start' if math.cos(angles[i])>.15 else 'end')
    if i==3:y+=10
    svg.append(f'<text class="label" x="{x:.2f}" y="{y:.2f}" text-anchor="{anchor}" dominant-baseline="middle">{name}</text>')
svg.append('</svg>')
out=ROOT/'assets/stats';out.mkdir(exist_ok=True)
(out/'strengths.svg').write_text(''.join(svg))
(out/'preview.html').write_text('''<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Strengths graph draft</title><style>*{box-sizing:border-box}body{margin:0;background:#000;color:#c5b5ec;font:13px/1.6 Menlo,Consolas,monospace;min-height:100svh;display:grid;place-items:center}main{width:min(100%,520px);padding:28px 12px}h1{font-size:17px;font-weight:400;margin:0 20px}figure{margin:8px 0 0}img{display:block;width:100%;height:auto}a{color:#c5b5ec;text-underline-offset:4px}footer{margin:0 20px;color:#9688b0;font-size:12px}a:focus-visible{outline:2px dashed #c5b5ec;outline-offset:5px}</style><main><h1>What I bring</h1><figure><img src="strengths.svg" alt="Six-axis strengths graph: taste is strongest, engineering and curiosity close behind, then execution, strategy and design."></figure><footer><a href="strengths.svg" download>Download graph</a></footer></main></html>''')
print(out/'preview.html')
