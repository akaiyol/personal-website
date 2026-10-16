# Work experience

## Sub-features

Stats show/hide toggle preserves the chart footprint, removes hidden chart input/accessibility, and supports keyboard operation, unchanged content positions and dimensions in both states; work type filters and per-role filter buttons; year links; role-linked strengths graph with keyboard comparison; an interactive procedural flower field below the timeline.

## How to get to it

Choose work-experience from Home or use the terminal. Select a filter or year. Scroll to the end for flowers. Swipe/drag right or scroll down/right over the field to grow; reverse to rewind. Vertical and horizontal wheel input over the field is captured without moving the website, including at growth limits. Focus the field and use Down/Right to grow, Up/Left to rewind, Home or End. The field grows automatically on first view; its quiet drag/swipe hint appears after completion and disappears after growth input. Scrolling outside the field continues to scroll the page.

## Verification

Run `run.cjs EVIDENCE work`. It checks stats toggle visibility and aria state, Enter/Space, unchanged page height, scroll position and element bounds before/after hiding and restoring, filters, year navigation, graph interactions, desktop and 390/320px layouts, field placement at the main content bottom, absence of the removed cat, full-growth counts (11 desktop / 6 mobile), keyboard growth, vertical/horizontal wheel growth without page scrolling, and hint dismissal. Inspect actual scrolled viewport and field screenshots, including stem rulers and canvas bottom alignment. The old SVG ruler helper is retained for historical reference and is not run: canvas text cannot be verified through SVG DOM styles.

Also verify pointer drag/touch-emulated swipe, horizontal wheel, vertical page scrolling, initial hint and partial growth, reduced motion, and at least a complete wind cycle with continuation after renderer changes. Numeric rulers use a common300-design-unit scale, with ticks to the bud attachment and distinct terminal values for different stem heights. Actual physical touch devices and real hidden-tab behavior require separate evidence before claiming verification.

## Model and constraints

Canvas 2D projects generated petal surfaces and numeric bowls; no flower bitmap is loaded by the live renderer. The website adapts flower-field revision 099a90e without its study controls. It starts at zero and grows once over3.8 seconds on first view; offscreen and hidden rendering pauses elapsed time. Manual growth cancels the entrance. Reduced motion shows full growth immediately. Both the content edge and stem roots end at the field bottom, above the fixed terminal. Reduced motion stops wind but allows explicit growth changes. Existing source images and older standalone studies remain historical assets.

Stats start hidden while preserving their layout space. The [ show stats ] label stays steady, surrounded by short radial lines. Three hand-traced line variations cycle at .72 seconds, matching the photo-frame line boil, until the first click (including keyboard activation) removes the halo permanently for that document. Reduced motion uses one static drawing. The desktop workflow checks this default and halo dismissal before exercising both visibility states. Narrow checks reuse the same session after opening stats.

Run `run.cjs EVIDENCE flowerIntro` for the entrance, post-growth mouse/trackpad/touch hints, offscreen pause, no replay after manual input, common-scale endpoints and narrow/static layouts. Review full field screenshots and complete growth/wind sequence. Trackpad hint detection uses wheel characteristics and is heuristic; hardware type is not exposed reliably.

Wide-screen layout: above900px, the timeline/stats/year group and its heading share a centred1100px maximum width. Extra space belongs outside the group; showing/hiding stats preserves the chart footprint. The responsive workflow checks the cap and alignment.
