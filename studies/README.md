# Wave validation studies

Serve the project root and open `foam-static.html` or `foam-deformation.html`. Both render actual Unicode Braille from the approved reference foam mask. They are isolated studies; the existing landing-page animation is unchanged.

The static study evaluates sampling and responsive proportions. The deformation study has play/pause and an eight-second scrubber; it tests a prescribed coordinate warp, not fluid dynamics. It fails the material-detachment gate and is not a production animation candidate. See `wave-review.md` for evidence and limitations.

The dot-only font is original project code, built by `scripts/build-braille-font.py` using fontTools. Its empty Braille cell has no outlines. Runtime uses no third-party JavaScript dependencies.
