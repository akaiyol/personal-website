# Design rules

This file contains visual design rules only. Feature specifications and detailed animation behaviour belong in separate files.

## Colour

- Use exactly two colours: **black `#000000`** and **purple `#C5B5EC`**.
- Use black for backgrounds and negative space; use purple for text, artwork, borders, and interface accents.
- Do not introduce white, blue, grey, additional purple shades, gradients, tinted surfaces, or coloured shadows.
- Create hierarchy through size, spacing, weight, character density, and negative space rather than additional colours or opacity shades.
- Apply the same palette across all visual states and screen sizes.
- Normal font antialiasing is allowed; intermediate edge pixels are rendering artefacts rather than palette colours.

## Visual language

- Maintain a rustic coding-terminal aesthetic with expressive, abstract text artwork.
- Construct artwork from characters such as `0`, `1`, punctuation, and Unicode Braille.
- Use character density and black gaps to define silhouettes, contours, and depth.
- Avoid raster illustrations, photography, SVG artwork, emoji, and uniform decorative dot noise.
- Keep borders thin and decoration restrained.

## Typography

- Use simple monospace typography for ordinary text. Avoid cursive and calligraphic treatments.
- Keep the personal introduction lowercase.
- Keep main text modest in size and readable, with supporting text smaller.
- Reserve very small characters for artwork rather than ordinary text.
- Build the display heading from tiny, bold binary characters. Its large letterforms must have thick, clearly readable strokes.
- Preserve character alignment and spacing within text artwork.

## Composition

- Keep the landing page compact, with a single-screen desktop composition when space permits.
- Use generous black space to balance dense character artwork.
- Maintain clear separation between text, artwork, and interface elements.
- Keep artwork from obscuring text or controls.
- Adapt the layout to narrow screens without horizontal overflow, clipped headings, or unreadably small ordinary text.

## Deferred artwork

On 2026-10-07, the user moved wave development to a separate repository for possible later integration. This website currently has no wave implementation.
