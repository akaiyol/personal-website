# Home planet

## User behavior

A cropped lavender Braille-style ringed planet replaces the home Snoopy. The globe uses the approved unshaded spherical outline. Ring strands are concentric planar circles projected as smooth ellipses, without radial waves or pointed distortion. Rotation changes narrow texture seams rather than deforming the geometry. Approximately 60% of the globe is visible at the right edge. Slow ring patterns and spherical reflection share a 64-second rotation phase. Drag outside the foreground text/buttons to rotate horizontally and vertically; focus the canvas and use arrows for keyboard rotation. Home title and buttons sit above the rings with black rims. No planet appears on other routes.

## Verification

Run `run.cjs EVIDENCE planet` from the canonical checkout as described in ../SKILL.md. The helper checks removal of the runner, 1280/390/320px overflow and foreground stacking, mouse drag, arrow keys, reduced-motion static phase, spin advancement, hidden-route pause/resume and home action navigation. Screenshots cover actual home viewports.

Inspect matched reference and rendered composition: visible globe crop, diagonal ring silhouette, fine dot-cell texture, spherical reflection, readable title/buttons and unobscured terminal. The phase observations establish advancement, not aesthetic quality. Observe at least 64 seconds plus continuation for motion review. Drag orientation is retained across route changes. The reflection is a stylized spherical band model, not physically ray-traced optics.

Reduced motion disables automatic rotation but preserves explicit drag/key changes. Resize and route/visibility/intersection handlers manage drawing. Actual background-tab pause and physical touchscreen behavior require separate live evidence; route pause is not proof of either. The renderer uses Canvas, without remote images or libraries.

## First-load intro

The first home load starts at the supplied steep-ring pose (roll 0.32 and pitch -1.40 radians), holds for 180ms, then eases over 3000/1.3 ms (about 2.31 seconds, 30% faster than the original turn) into the original roll 0.32. Home content stays fixed. Drag or arrow input cancels the intro at its current pose. Leaving Home finishes the intro so returning does not replay it. Reduced motion skips immediately to the original pose. Observe the full intro and continuation at desktop and narrow widths; its short sequence is separate from the unchanged 64-second ring texture cycle. The helper checks initial running state, reference-facing negative pitch and roll, black globe interior from actual canvas pixels, final angle, unchanged hero bounds and no replay; input interruption should also be exercised after intro changes.

## Hover discovery

After intro, hovering the globe or ring footprint gives a slight eased tilt and a pointer-following [ drag ↔ ] hint. Empty canvas and foreground controls do not trigger the hint. Pointer exit restores the base orientation. A click alone retains the hint; a drag beyond 6px or keyboard rotation dismisses it for the document, including route returns. Reduced motion preserves the hint but disables hover tilt. The helper tests tilt, stationary home content, hint entry/exit, click retention and drag dismissal. Physical-device touch does not have hover and is not claimed tested.

## Distant stars
Small, sparse lavender points occupy the black sky behind the planet. A fixed sphere of directions follows the same view transform and slow phase as the planet; drag, keyboard, intro and hover rotate the sky coherently. The globe masks background stars. Read-only `data-stars` exposes visible star IDs and projected positions for interaction checks. Verify actual rendered points, movement of shared IDs after rotation, static positions under reduced motion and no changes to foreground layout. Review the full 64-second cycle plus continuation.
