# Work experience

## Sub-features

Work type filters and per-role filter buttons; year links; role-linked strengths graph with keyboard comparison; an interactive procedural flower field below the timeline.

## How to get to it

Choose work-experience from Home or use the terminal. Select a filter or year. Scroll to the end for flowers. Swipe/drag right or use horizontal wheel input to grow; reverse to rewind. Focus the field and use Left/Right, Home or End. The initial quiet hint disappears after growth input, not ordinary vertical scrolling.

## Verification

Run `run.cjs EVIDENCE work`. It checks filters, year navigation, graph interactions, desktop and 390/320px layouts, field placement at the main content bottom, absence of the removed cat, full-growth counts (11 desktop / 6 mobile), keyboard growth and hint dismissal. Inspect actual scrolled viewport and field screenshots, including stem rulers and canvas bottom alignment. The old SVG ruler helper is retained for historical reference and is not run: canvas text cannot be verified through SVG DOM styles.

Also verify pointer drag/touch-emulated swipe, horizontal wheel, vertical page scrolling, initial hint and partial growth, reduced motion, and at least a complete wind cycle with continuation after renderer changes. Numeric rulers remain .10 through .80 on the right side. Actual physical touch devices and real hidden-tab behavior require separate evidence before claiming verification.

## Model and constraints

Canvas 2D projects generated petal surfaces and numeric bowls; no flower bitmap is loaded by the live renderer. The website adapts flower-field revision 099a90e without its study controls. It starts at 25% growth. Both the content edge and stem roots end at the field bottom, above the fixed terminal. Reduced motion stops wind but allows explicit growth changes. Existing source images and older standalone studies remain historical assets.
