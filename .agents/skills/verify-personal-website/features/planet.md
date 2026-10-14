# Home planet

## User behavior

A cropped lavender Braille-style ringed planet replaces the home Snoopy. Approximately 60% of the globe is visible at the right edge. Slow ring patterns and spherical reflection share a 64-second rotation phase. Drag outside the foreground text/buttons to rotate horizontally and vertically; focus the canvas and use arrows for keyboard rotation. Home title and buttons sit above the rings with black rims. No planet appears on other routes.

## Verification

Run `run.cjs EVIDENCE planet` from the canonical checkout as described in ../SKILL.md. The helper checks removal of the runner, 1280/390/320px overflow and foreground stacking, mouse drag, arrow keys, reduced-motion static phase, spin advancement, hidden-route pause/resume and home action navigation. Screenshots cover actual home viewports.

Inspect matched reference and rendered composition: visible globe crop, diagonal ring silhouette, fine dot-cell texture, spherical reflection, readable title/buttons and unobscured terminal. The phase observations establish advancement, not aesthetic quality. Observe at least 64 seconds plus continuation for motion review. Drag orientation is retained across route changes. The reflection is a stylized spherical band model, not physically ray-traced optics.

Reduced motion disables automatic rotation but preserves explicit drag/key changes. Resize and route/visibility/intersection handlers manage drawing. Actual background-tab pause and physical touchscreen behavior require separate live evidence; route pause is not proof of either. The renderer uses Canvas, without remote images or libraries.
