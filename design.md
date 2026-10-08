# Design rules

Shared visual source of truth. Record agreed design rules here. Use the open design notes below for ideas that need discussion; move approved decisions into the relevant component section. Detailed interaction behaviour belongs in `navigation.md`.

## Colour

- Use exactly two colours: **black `#000000`** and **purple `#C5B5EC`**.
- Use black for backgrounds and negative space; use purple for text, artwork, borders, and interface accents.
- Do not introduce white, blue, grey, additional purple shades, gradients, tinted surfaces, or coloured shadows.
- Create hierarchy through size, spacing, weight, character density, and negative space rather than additional colours or opacity shades.
- Apply the same palette across all visual states and screen sizes.
- Normal font antialiasing is allowed; intermediate edge pixels are rendering artefacts rather than palette colours.

## Visual language

- Use a macOS Terminal-inspired shell as the interface reference: a user/host identity, working-directory marker, shell prompt, fixed-width text, and block cursor.
- Keep expressive character artwork within this terminal frame.
- Prefer terminal line structure and character-grid alignment over conventional search-box styling.
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

- Keep a consistent shell width and top position across routes. The shell has a minimum height filling the available viewport inside its outer margins.
- Keep the landing page compact when space permits; longer pages extend naturally and scroll with the document. Do not constrain them inside a second vertical scrollbar.
- Changing destinations starts at the top; work year links jump to their sections while the year selector stays visible.
- Use generous black space to balance dense character artwork.
- Maintain clear separation between text, artwork, and interface elements.
- Keep artwork from obscuring text or controls.
- Adapt the layout to narrow screens without horizontal overflow, clipped headings, or unreadably small ordinary text.

## Deferred artwork

On 2026-10-07, the user moved wave development to a separate repository for possible later integration. This website currently has no wave implementation.

## Interface language

- Use no unnecessary words. Make interactions intuitive through design: prompt structure, cursor, alignment, focus, selected states, and responsive feedback.
- Do not display persistent instructional text such as “type to navigate”, “tab to complete”, or “enter to go”.
- Keep labels that identify destinations and essential state or error feedback. Keep keyboard guidance available to assistive technology without displaying it as decoration.

## Components

### Shell frame and identity

- Keep the thin purple frame on black.
- Header identity: `yolanda@web:~`, linking home. Do not add upper navigation tabs; the terminal command line provides destination navigation.
- Command-line identity: `yolanda@web ~ %`, following the shape of a macOS zsh prompt. Treat the prompt as a functional part of the terminal theme.

### Command line and cursor

- Keep the identity, typed text, completion, and cursor on the same baseline.
- Use a rectangular block cursor with discrete visible/hidden blinking. No fading or smooth transitions.
- Demonstration text plays once, then leaves an empty prompt and waiting block cursor. Typing takes control immediately.
- Reduced motion uses a stationary cursor and skips demonstration typing.

### Completion and recommendations

- Use the same monospace family and size for the command text, candidate labels, and external-link annotation.
- Use character-based horizontal spacing and consistent line rhythm, with slightly more vertical room than a terminal for pointer use.
- Show the inline completion suffix with a simple underline. The cursor marks where the visitor's typed text ends.
- Use inverse black-on-purple text for the selected candidate. Avoid secondary tiny category labels or separate search-widget typography.
- Keep external destinations visibly identified.

## Open design notes

Use this section for future thoughts before adopting them as rules. Each note should identify the component, intended feeling or behaviour, and a reference when useful.

- Header identity placement: retain for now; review how its role differs from the functional footer prompt.
- Terminal density: command text and suggestions now share a type scale. Refine overall page spacing after reviewing this version.
- Window chrome: no macOS traffic-light buttons or title bar added; the current reference applies to the terminal content and prompt.

## About Me direction — implemented

- A personal collection of framed images, combining character-built Braille artwork with thin line-art frames.
- A framed portrait and background introduction sit above a hanging collection of life images.
- Mix picture frames, Polaroids, perforated postage-stamp edges, film negatives, and paper mounts. Keep them recognizably related through the same palette and line weight.
- Life-photo frames include attached date tags and optional short captions. Leave these blank until supplied.
- The image line should feel physically pinned and irregularly arranged, with believable overlaps and clear negative space.
- Important terms use a purple rectangle with black lettering when emphasized. The live page reveals this emphasis on pointer proximity, focus, or touch selection.
- Personal photographs will supply the subject matter; the proposed treatment converts them to black/purple Braille or line art. This page-specific treatment needs review before replacing the current restriction on displaying photography.
- Composition and interaction specification: `feature.md`. Static reference: `about-me-static.html`. The user authorized implementation on 2026-10-07; the live About route now follows this direction.

### Frame refinement — 2026-10-07

- The user approved the portrait/introduction above the hanging image line. Preserve that composition.
- Portrait uses a postage-stamp ridge: visible rounded perforations around all four sides and a dotted inset keyline. Connect the rounded cut-outs with short straight ridges to form one continuous scalloped perimeter, without a separate enclosing rectangle.
- Frame variation must come from silhouette, construction, and dot/line texture, rather than repeated rectangular outlines with different padding.
- Hanging studies now contrast an arched stamp window, film sprocket rails, a broad-bottom Polaroid, torn notepad binding/ridges, with no circular/oval frame.
- Keep all frame materials black and purple. Dates and optional captions remain blank.

### Hanging collection density

- The user wants a somewhat crowded line, with eight placeholder photos and intentional overlaps in the live implementation. Preserve an exposed area for every photo.
- Hovering a photo brings it to the front; keyboard focus and touch selection provide equivalent access. Keep neighbouring photos in place.
- Do not use circular/oval frames. Stamp edges have perforations without an enclosing straight outer rectangle.

## Work timeline — implemented

- Use one vertical line with reverse chronological year sections and concise role summaries.
- Year breaks use outlined diamond markers and Georgia serif labels, an approved exception to ordinary monospace typography. Individual role markers remain square.
- Keep a vertical sticky year selector on the right, including on narrow screens. Use black text on purple for the current year.
- Retain the terminal header and functional footer prompt. Specification: `work-timeline-draft.md`.
