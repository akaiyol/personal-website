# Work experience and circuit cat

Timeline filters, year navigation, strengths display and the animated board at the timeline end.

## Sub-features

- Every work type filter updates visible matching roles, year availability and cat placement; role tags provide a second filter entry.
- All resets filtering; year links scroll to an experience year.
- Strengths graphic follows scroll context; click, Enter and Space toggle role/overall comparison.
- Final visible year contains one cat and a tail gap matching one entry height.
- Tail animation completes a 1.6-second cycle; body/board remain fixed.
- Reduced motion is static; leaving Work pauses the canvas.
- Desktop and 390/320px composition has no horizontal overflow.

## How to get to it (user POV)

Home my work action, Home shortcut 2, terminal work-experience; year links within Work.

## Driving it with Playwright

Preconditions: launch from the canonical checkout as documented in ../SKILL.md.

- Run: the documented command with feature ID `work` instead of `all`.
- Actions and proof: Use AI product and All filters, click 2023, scroll to the cat, record a full loop and next-loop transition, toggle reduced motion, leave Work, then repeat at narrow widths.
- Evidence: inspect the feature screenshots, ARIA snapshots, action log and trace in the selected directory.

## Gotchas

Cat follows the final visible year after filtering. Scroll observation selects strength context; do not set graph values directly. Hidden-document lifecycle requires actual visibility transition or source-backed limitation; hidden-route pause alone does not prove hidden-tab pause.

## Current scope correction

The circuit cat was removed at the user’s request. Cat placement and animation recipes above are historical and no longer apply. Verify its absence and retain timeline/filter/layout checks.
