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
- Anchor the ocean artwork along the bottom, reaching the right boundary.
- Keep artwork from obscuring text or controls.
- Adapt the layout to narrow screens without horizontal overflow, clipped headings, or unreadably small ordinary text.

## Ocean art direction

- Primary approved composition reference: [wave-approved-2026-10-06.png](artifacts/references/wave-approved-2026-10-06.png). User approved on 2026-10-06. Hokusai's *The Great Wave off Kanagawa* remains the underlying visual and emotional inspiration. The raster is a reference only; production artwork remains characters.
- Aim for anger, violence, chaos, weight, danger, and coordinated force rather than a calm decorative ocean.
- Use large asymmetric forms, dramatic curvature, steep faces, overhangs, hooked tips, foam fingers, trailing peaks, and substantial black hollows.
- Show several scales simultaneously, with irregular spacing and overlapping forms. Avoid a row of similar wave emblems or smooth repeated sine curves.
- The composition should read as one body of water, with a dramatic concentration of force at the right boundary.
- Keep the overall visual rhythm irregular: dense active regions balanced by black space, with changing dominant forms rather than equally emphasized peaks.
- Use purple Braille exclusively for foam, foam-covered breaking features, and airborne spray. Both background and unfoamed water remain unmarked black. Foam placement implies water volume.
- Concentrate dense purple dots in connected foam patches, breaking caps, irregular downward rakes, and impact foam. Use broken foam streaks and sparse spray at smaller scales. Do not draw generic water contours, fill water interiors, or invert the empty background.
- Preserve black negative space between foam branches and within curls so the ocean remains sculptural and legible.
- The visual result should communicate weight, asymmetry, pressure, and force without becoming uniformly dense noise.

Preserve the approved broad asymmetric base, forward-reaching crown, unequal clustered branches, overlapping lower foam, and large open hollow. Responsive framing must preserve these proportions; do not squeeze the entire wide domain into a tall narrow frame.

Detailed motion, procedural systems, and review workflow belong in the wave documents, not this file.
