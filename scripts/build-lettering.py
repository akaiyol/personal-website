"""Build custom calligraphic lettering as Unicode Braille text."""
from PIL import Image, ImageDraw
from pathlib import Path
import math, random, re
ROOT=Path(__file__).resolve().parent.parent
im=Image.new('L',(900,210));draw=ImageDraw.Draw(im);rng=random.Random(19)
# Cubic pen paths in a shared coordinate system: x-height 45, baseline 105.
letters={
'i': [[(0,100),(8,89),(18,65),(25,48),(13,80),(7,104),(18,104),(25,103),(32,96),(38,91)]],
'm': [[(0,102),(14,78),(24,47),(31,45),(38,40),(28,74),(22,94),(34,65),(52,40),(61,48),(66,56),(48,83),(44,102),(54,76),(75,43),(84,47),(98,48),(70,91),(77,104),(87,110),(100,98),(109,91)]],
'y': [[(0,96),(16,76),(26,43),(32,46),(39,53),(8,103),(26,104),(41,104),(59,63),(69,45)],[(69,45),(52,84),(34,126),(7,159),(-18,191),(-115,191),(-104,155),(-98,132),(-50,127),(-50,146),(-48,159),(-69,170),(-80,167)]],
'o': [[(41,51),(17,31),(-9,104),(15,108),(42,113),(69,37),(41,51),(31,60),(37,80),(57,82),(65,84),(73,78),(77,74)]],
'l': [[(0,103),(26,65),(95,-14),(69,10),(48,20),(20,75),(13,96),(8,112),(30,107),(43,95)]],
'a': [[(40,53),(16,35),(-8,104),(16,108),(31,112),(46,75),(51,53)],[(51,53),(42,71),(23,103),(36,107),(48,110),(60,96),(65,91)]],
'n': [[(0,105),(12,83),(31,49),(35,47),(44,41),(27,76),(20,98),(38,69),(59,42),(69,49),(81,53),(51,98),(62,107),(73,112),(88,97),(94,92)]],
'd': [[(40,55),(20,35),(-12,106),(15,108),(41,108),(62,47),(82,13),(105,-18),(116,5),(92,33),(73,53),(51,80),(42,101),(36,117),(63,104),(70,97)]]
}
def path(points,ox):
 for i in range(0,len(points)-1,3):
  p=points[i:i+4]
  if len(p)!=4:break
  for step in range(151):
   t=step/150;u=1-t
   x=u**3*p[0][0]+3*u*u*t*p[1][0]+3*u*t*t*p[2][0]+t**3*p[3][0]+ox
   y=u**3*p[0][1]+3*u*u*t*p[1][1]+3*u*t*t*p[2][1]+t**3*p[3][1]+15
   # A broad diagonal nib gives strong thick/thin stroke contrast.
   r=1+rng.uniform(-.13,.13)
   draw.polygon([(x-6*r,y+6*r),(x+5*r,y-7*r),(x+8*r,y-4*r),(x-3*r,y+9*r)],fill=255)
x=80
for letter,advance in [('i',38),("'",18),('m',106),(' ',20),('y',74),('o',70),('l',45),('a',64),('n',91),('d',74),('a',60)]:
 if letter=="'":path([(9,34),(15,15),(15,16),(3,39)],x)
 elif letter!=' ':
  for points in letters[letter]:path(points,x)
  if letter=='i':draw.ellipse((x+27,38,x+36,47),fill=255)
 x+=advance
# Sparse edge nicks and small gaps suggest irregular dry ink rather than noise.
for _ in range(250):
 px=rng.randrange(im.width);py=rng.randrange(im.height)
 if im.getpixel((px,py)):
  draw.ellipse((px,py,px+rng.randrange(1,4),py+rng.randrange(1,3)),fill=0)
box=im.getbbox();im=im.crop((box[0]-5,max(0,box[1]-5),box[2]+5,min(im.height,box[3]+5)))
w=240;im=im.resize((w,round(im.height*w/im.width)),Image.Resampling.LANCZOS)
dots=[(0,0,0),(0,1,1),(0,2,2),(1,0,3),(1,1,4),(1,2,5),(0,3,6),(1,3,7)];rows=[]
for y in range(0,im.height,4):
 row=''
 for x in range(0,w,2):
  bits=sum(1<<bit for dx,dy,bit in dots if y+dy<im.height and im.getpixel((x+dx,y+dy))>95)
  row+=chr(0x2800+bits)
 rows.append(row)
art='\n'.join(rows)
(ROOT/'yolanda-braille.txt').write_text(art+'\n')
p=ROOT/'index.html';s=p.read_text();s=re.sub(r'(<span class="dot-script" aria-hidden="true">).*?(</span>)',lambda m:m[1]+art+m[2],s,flags=re.S);p.write_text(s)
