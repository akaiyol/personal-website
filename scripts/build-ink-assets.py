#!/usr/bin/env python3
"""Bake the existing sRGB SVG ink filter into cropped, lossless RGBA assets."""
from pathlib import Path
from PIL import Image
ROOT = Path(__file__).resolve().parents[1]
INK = (197, 181, 236)
ASSETS = [
    ('handwritten-name.jpg', 'handwritten-name-ink.png', (215, 240, 440, 355)),
    ('Untitled_Artwork.jpg', 'poem-ink.png', (350, 270, 1430, 1050)),
]

def build(root=ROOT):
    folder=root/'assets/poem'
    for source, output, crop in ASSETS:
        with Image.open(folder/source) as original:
            image=original.convert('RGB').crop(crop)
        alpha=bytearray(image.width*image.height)
        for i,(r,g,b) in enumerate(image.getdata()):
            luminance=.2126*r+.7152*g+.0722*b
            alpha[i]=round(max(0,min(255,(255-luminance)*1.3-255*.025)))
        ink=Image.new('RGBA',image.size,INK+(0,))
        ink.putalpha(Image.frombytes('L',image.size,bytes(alpha)))
        ink.save(folder/output,optimize=True)
        print(f'{output}: {image.width}x{image.height}')

if __name__=='__main__':
    build()
