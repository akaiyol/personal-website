# About Me — framed life collection

Status: approved for website implementation 2026-10-07. The live `#about` route uses the approved layout and frame treatment. Source photos are still pending; character-art placeholders and blank dates/captions remain. The standalone static mock remains as a reference.

## Purpose and visual direction

Introduce Yolanda through her background and a personal collection of images. Use the established black `#000000` and purple `#C5B5EC` palette, monospace text, and terminal frame. Remove the upper navigation tabs; use the existing command line for destination navigation.

Frames use thin line art, Braille, or both. Personal photo subjects should remain recognizable when converted to the chosen character-art treatment. The mock uses generic placeholder scenes rather than representing actual events or likenesses.

No unnecessary words. Convey interaction through cursor, pins, overlap, selection, and focus states. Keep meaningful labels and accessible descriptions; avoid persistent tutorials.

## Composition

1. A framed portrait paired with the About Me heading and background introduction. Use the user-supplied background and interests below. Refine wording and emphasis through the static review.
2. Below it, a slightly sagging laundry or film-drying line holds a series of personal images. Vary frame dimensions, orientation, and small rotations. Clips or pins visibly connect each frame to the line.
3. Show one selected image in front of its neighbours, with an unobstructed subject and a small increase in scale. Preserve enough of the hanging arrangement to retain context.
4. Keep the footer terminal prompt and home identity. Avoid a second navigation bar.

The static mock shows one selected Polaroid and two permanently highlighted terms as samples of the proposed states. It has no pointer-driven highlighting, drag behaviour, gallery selection, or animation.

## Frame vocabulary

| Frame | Distinctive construction | Use in first mock |
| --- | --- | --- |
| Portrait stamp | Rounded perforated ridge on all four sides, dotted inset keyline | Main portrait |
| Postage stamp | Coarse perforations, arched image window, dotted inner edge | Hanging image |
| Polaroid | Narrow top/side margins and a deeper bottom band | Selected hanging image |
| Film negative | Contrasting sprocket rails and rectangular holes | Hanging image |
| Notepad sheet | Torn binding ridge, loops, dotted margin and ruled baseline | Hanging image |
| Oval mount | Removed at user request | Do not use |
| Contact sheet | Several small exposures within one border | Possible later variant |
| Photo-album corners | Four diagonal mounting pockets, exposed paper between them | Possible later variant |
| Ticket stub | Perforated end, narrow vertical stub, cropped corners | Possible later variant |
| Oval locket | Removed with circular/oval frames | Do not use |
| Postcard | Simple border, stamp corner, divided reverse side | Possible later variant |

Use a curated set. Do not include every variant simply because it exists. Keep image art dominant over frame decoration.

## Photo dates and captions

- Each life photo has a date tag. Dates are blank in the current mock; do not invent dates or show placeholder date text.
- Some photos may have a short caption. Keep all captions blank until the user supplies them. An empty caption should not display explanatory copy.
- Keep the date and caption attached to the image when it moves, is selected, or is repinned. They must never become detached gallery labels.
- Store photo identity, source, accessible description, date, and optional caption separately from the frame style and position.
- Use a semantic `time` element when a date is available. Leave its machine-readable date absent while blank. Exact date presentation will be reviewed with real content.
- Reserve a small space for date tags within the paper mount or Polaroid band. Keep metadata quieter than the photo without shrinking it to an unreadable size.

## Implemented interactions

### Bring an image to the front

- Hovering a photo brings it in front of neighbouring photos without navigating away. Leaving it restores its place unless it has been explicitly selected.
- Keyboard focus offers the same preview. Touch or clicking selects an image and keeps it in front until another selection or dismissal.
- Lift and slightly enlarge it, retaining a visible relationship to its original pin and place on the line.
- Keep the image subject clear; do not hide the introduction or terminal input.
- Another selection returns the previous image to its hanging state. Escape restores the line. Moving between neighbouring hover targets must not cause flickering or unreachable images.
- Provide a keyboard focus indicator and an accessible selected state. Do not communicate selection through motion alone.

### Drag and repin

- Drag from the image body after a small movement threshold; a click selects instead of accidentally dragging.
- Constrain repositioning to the gallery. On release, snap the image's clip to an allowed position on the line and update overlap order.
- Keep images reachable and prevent overlapping the terminal or introduction. Do not persist arbitrary positions unless explicitly requested.
- Support touch and a keyboard alternative for changing position; retain normal page scrolling outside the active drag.
- Selected photos stay near their original pin. Mouse dragging lifts them temporarily; release returns them vertically to the line at the new horizontal pin position.

### Important terms

- Author a small explicit list of important phrases in the introduction.
- As the pointer approaches a phrase, show black words on a purple rectangular background. Remove the highlight when the pointer moves away.
- Use proximity to the term, not unrelated mouse movement anywhere on the screen. Avoid flashing several distant terms at once.
- Highlighting must not alter font metrics, line breaks, or layout. Keep the base text readable without the effect.
- Keyboard focus and touch must offer an equivalent way to reveal emphasis. The information must never require hover.
- Pointer proximity uses a 24-pixel range and emphasizes only the closest authored phrase. Static mock highlights demonstrate appearance only.

### Stretch goal: animated hand

A line-art or Braille hand enters, grasps an image, lifts it, and pins it back to the line. Add only after basic selection, dragging, and repinning feel coherent. The hand must not obscure content, block input, or imply controls that do not exist. Reduced motion uses an immediate position change. Final hand style and choreography remain unapproved.

## Responsive and accessibility requirements

- Desktop: portrait and introduction side by side; a wide hanging collection underneath.
- Narrow screens: portrait above text; retain readable type. The image line may scroll horizontally, keeping frames at a useful size and revealing part of the next frame as an affordance.
- Use semantic introduction text and meaningful image descriptions. Hide decorative character art and frames from assistive technology.
- Interactive image targets must support keyboard operation, visible focus, and comfortable touch sizes.
- Reduced motion removes lift, sway, and hand animation; selection and repinning still work.
- Pause animation work when the page is hidden. Avoid constant ambient movement.

## User-supplied biography content

Provided 2026-10-07:

- Electrical and Computer Engineering at the University of Waterloo (ECE '27 already present on the site).
- Loves product management and coding fun projects.
- Has painted and drawn since childhood.
- Plays piano: RCM level 10.
- Loves reading; The Poppy War is the all-time favourite series.
- Built their own PC; also enjoys video games and frisbee.
- Closing sentiment: “I'm someone that gets inspired by everything around me and would love to experience more.”

The mock uses lightly edited first-person copy. Product management and painting/drawing are highlighted as sample emphasis states; the final list of important terms remains open for review.

## Content still needed

- Portrait source and preferred crop.
- Review of the drafted background introduction and important phrases (the user has supplied the content).
- Initial personal photos, intended order, dates, short meaningful descriptions, and optional captions. Dates and captions remain blank for now.
- Choice of Braille versus line-art conversion for photo subjects; compare recognizability before adopting a technique.
- Preferred selected-image position and scale, approved frame mix, and mobile treatment.

## Remaining milestones

1. Layout approved. Review the revised frame vocabulary and photo treatment.
2. Replace placeholder artwork and draft copy with user-supplied content; review the static page again.
3. Selection, term emphasis, and drag/repin are implemented; refine with the user's actual photos.
4. Consider the animated hand only after the basic interactions pass review.

## Current deliverables

- `about-me-static.html`: standalone static mock, separate from the live About Me view.
- `design.md`: shared visual direction and open design notes.
- Upper navigation tabs removed from the existing website; terminal navigation retained.

## Static study verification

- Rendered desktop and a narrow layout at approximately 389 CSS pixels. The document has no horizontal overflow; only the hanging collection scrolls horizontally on narrow screens.
- Mock contains no scripts or animation. Portrait and life artwork are character-built generic placeholders.
- Biography uses the user's supplied information; emphasis is shown as a static appearance sample.
- Live About Me remains unchanged. Only the redundant upper navigation tabs were removed from the live site.

## Frame revision — 2026-10-07

The user approved the layout and requested more variation through dots, lines, textures, and shapes, with a stamp ridge for the portrait. The static revision preserves the layout, biography, hanging line, and blank photo metadata. No animation or gallery interactions are introduced.

## Crowded line revision — 2026-10-07

- Remove the circular/oval frame from the static mock and planned frame set.
- Keep the stamp perforations but remove the outer straight rectangular outline from both the portrait stamp and the hanging stamp. Inner image boundaries may remain.
- During implementation, add more user-supplied photos to create a somewhat crowded line with varied sizes and intentional overlaps. Start by evaluating approximately seven to nine photos rather than four widely spaced images; the final count depends on supplied content and available width.
- Hover raises the targeted photo above its neighbours. Do not reshuffle the line or move adjacent photos just to reveal it. Every photo needs an exposed area that can be hovered, tapped, or focused.
- This direction is now implemented with eight placeholder frames. Keep dates and optional captions blank.

## Website implementation — 2026-10-07

- Integrated the portrait, biography, stamp edges, and eight overlapping placeholder frames at `#about`.
- Hover/focus brings photos forward. Click/tap or Enter/Space selects; Escape dismisses.
- Mouse dragging repins along the line. Touch uses the pin as its drag handle so the image body can scroll the gallery. Alt+Left/Right repins with a keyboard. Positions remain local to the current page session.
- Repinning preserves at least a small exposed strip between pin positions so every photo remains reachable.
- Important phrases respond to pointer proximity, focus, and tap/keyboard toggling without changing text metrics.
- Reduced motion removes lift transitions; visibility and route changes clear pending proximity work. Hidden hero artwork stops updating on the About route.
- The animated hand remains deferred. No source photographs or dates have been invented.

### Live implementation verification

- Browser: eight frames rendered on desktop; a narrow layout at 389 CSS pixels had no horizontal document overflow and a scrollable gallery. Dates and captions remain empty.
- Verified keyboard selection, Escape dismissal, Alt+Arrow repinning, access to the last photo, and terminal navigation from Home to About.
- Verified mouse dragging changed a photo's pin position and cleared transient drag styles on release. Pointer proximity added term emphasis, and moving away removed it.
- JavaScript syntax, whitespace checks, and browser error checks passed.
- Touch pin dragging and reduced-motion styling are implemented but were not verified on a physical touchscreen or through OS preference changes.
