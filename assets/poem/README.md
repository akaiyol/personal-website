# Handwriting artwork

The handwriting and poem keep their original source crops, lavender #C5B5EC ink and transparent paper. `scripts/build-ink-assets.py` bakes the original sRGB SVG colour-matrix, alpha transfer (1.3 × inverse luminance − .025) and lavender flood/composite into cropped lossless PNGs. Run it with Python and Pillow from any working directory; paths resolve relative to the script.

- `handwritten-name-ink.png`: source `handwritten-name.jpg`, crop (215,240)–(440,355), 225×115.
- `poem-ink.png`: source `Untitled_Artwork.jpg`, crop (350,270)–(1430,1050), 1080×780.

The SVG viewBoxes, displayed dimensions, semantic labels and poem-word target are unchanged. The browser no longer evaluates those static ink filters. JPEG originals remain in the repository and hosting allowlist for source recovery and older cached pages; current HTML requests the PNGs. Do not recolour or redraw the source handwriting when regenerating these performance assets.

Rendered baseline/new comparisons at 1470,1280,820,390,320px preserve composition and lettering. Pixel differences are expected from filter rounding and scaled raster sampling; screenshots at actual page size establish visual fidelity, not byte identity.
