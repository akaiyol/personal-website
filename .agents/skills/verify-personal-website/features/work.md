# Work experience

## Sub-features

Desktop stats show/hide preserves the chart footprint; phones use an overlay, removes hidden chart input/accessibility, and supports keyboard operation, unchanged content positions and dimensions in both states; work type filters and per-role filter buttons; year links; role-linked strengths graph with keyboard comparison; an interactive procedural flower field below the timeline.

## How to get to it

Choose work-experience from Home or use the terminal. Select a filter or year. Scroll to the end for flowers. Swipe/drag right or scroll down/right over the field to grow; reverse to rewind. Vertical and horizontal wheel input over the field is captured without moving the website, including at growth limits. Focus the field and use Down/Right to grow, Up/Left to rewind, Home or End. The field grows automatically on first view; its quiet drag/swipe hint appears after completion and disappears after growth input. Scrolling outside the field continues to scroll the page.

## Verification

Run `run.cjs EVIDENCE work`. It checks stats toggle visibility and aria state, Enter/Space, unchanged page height, scroll position and element bounds before/after hiding and restoring, filters, year navigation, graph interactions, desktop and 390/320px layouts, field placement at the main content bottom, absence of the removed cat, full-growth counts (11 desktop / 6 mobile), keyboard growth, vertical/horizontal wheel growth without page scrolling, and hint dismissal. Inspect actual scrolled viewport and field screenshots, including stem rulers and canvas bottom alignment. The old SVG ruler helper is retained for historical reference and is not run: canvas text cannot be verified through SVG DOM styles.

Also verify pointer drag/touch-emulated swipe, horizontal wheel, vertical page scrolling, initial hint and partial growth, reduced motion, and at least a complete wind cycle with continuation after renderer changes. Numeric rulers use a common300-design-unit scale, with ticks to the bud attachment and distinct terminal values for different stem heights. Actual physical touch devices and real hidden-tab behavior require separate evidence before claiming verification.

## Model and constraints

Canvas 2D projects generated petal surfaces and numeric bowls; no flower bitmap is loaded by the live renderer. The website adapts flower-field revision 099a90e without its study controls. It starts at zero and grows once over3.8 seconds on first view; offscreen and hidden rendering pauses elapsed time. Manual growth cancels the entrance. Reduced motion shows full growth immediately. Both the content edge and stem roots end at the field bottom, above the fixed terminal. Reduced motion stops wind but allows explicit growth changes. Existing source images and older standalone studies remain historical assets.

Stats start hidden while preserving their layout space. The [ show stats ] label stays steady, surrounded by short radial lines. Three hand-traced line variations cycle at .72 seconds, matching the photo-frame line boil, until the first click (including keyboard activation) removes the halo permanently for that document. Reduced motion uses one static drawing. The desktop workflow checks this default and halo dismissal before exercising both visibility states. Narrow checks reuse the same session after opening stats.

Run `run.cjs EVIDENCE flowerIntro` for the entrance, post-growth mouse/trackpad/touch hints, offscreen pause, no replay after manual input, common-scale endpoints and narrow/static layouts. Review full field screenshots and complete growth/wind sequence. Trackpad hint detection uses wheel characteristics and is heuristic; hardware type is not exposed reliably.

Wide-screen layout: keep the timeline and heading anchored to the original content left edge. The experience column, summaries and feature lists expand with available width; no1100px group cap or fixed summary/list width. The chart retains its own width and hidden footprint. Responsive checks verify left alignment and that experience content fills its column.

RBC uses AI product, GTM, Data and Engineering tags. GTM is filterable from the filter bar and the RBC tag. RBC must not match Strategy or Growth; its focus reads “Internal adoption & GTM strategy”. Other roles retain their existing tags.

Stats have six corners: Strategy, Engineering, Design, Curiosity, Execution and Taste. Communication is omitted from every role and the overall chart; grids, labels and comparison polygons share the six-axis geometry.

Phone layout (2026-10-17): stats use a native dialog at widths up to700px and coarse-pointer landscape up to500px tall. No chart slot is reserved in the phone timeline. Year links form a horizontal sticky row; work content fills the available width. Show/close/Escape/Enter/Space preserve timeline geometry; dialog focus stays within the modal. Desktop stats retain their existing column and visibility footprint. Resize moves the same chart between its desktop home and the phone dialog. Closing the route closes phone stats.
