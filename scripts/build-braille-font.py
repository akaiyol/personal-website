from pathlib import Path
from fontTools.fontBuilder import FontBuilder
from fontTools.pens.ttGlyphPen import TTGlyphPen
import math

# Original dot-only glyphs. No inactive-dot outlines; U+2800 is genuinely empty.
root = Path(__file__).resolve().parents[1]
font = FontBuilder(1000, isTTF=True)
names = ['.notdef'] + [f'braille{n:02x}' for n in range(256)]
font.setupGlyphOrder(names)
font.setupCharacterMap({0x2800+n:names[n+1] for n in range(256)})
positions=[(125,875),(125,625),(125,375),(375,875),(375,625),(375,375),(125,125),(375,125)]
glyphs={}
for index,name in enumerate(names):
    pen=TTGlyphPen(None)
    if index:
        for bit,(cx,cy) in enumerate(positions):
            if (index-1)&(1<<bit):
                points=[(round(cx+96*math.cos(2*math.pi*k/24)),round(cy+96*math.sin(2*math.pi*k/24))) for k in range(24)]
                pen.moveTo(points[0])
                for point in points[1:]: pen.lineTo(point)
                pen.closePath()
    glyphs[name]=pen.glyph()
font.setupGlyf(glyphs)
font.setupHorizontalMetrics({name:(500,0) for name in names})
font.setupHorizontalHeader(ascent=1000,descent=0,lineGap=0)
font.setupNameTable({'familyName':'Wave Braille','styleName':'Regular','uniqueFontIdentifier':'WaveBraille-Regular-1','fullName':'Wave Braille Regular','psName':'WaveBraille-Regular','version':'Version 1.000','copyright':'Original project glyphs, 2026.'})
font.setupOS2(sTypoAscender=1000,sTypoDescender=0,sTypoLineGap=0,usWinAscent=1000,usWinDescent=0)
font.setupPost()
font.save(root/'assets/fonts/WaveBraille-Regular.ttf')
