# Work experience

## Sub-features

Work type filters and per-role filter buttons; year links; role-linked strengths graph with keyboard comparison; a full-width animated flower field below the timeline.

## How to get to it (user POV)

Choose work-experience from Home or use the terminal. Select a filter or year. Scroll to the end for the flowers.

## Driving it with Playwright

Run `run.cjs EVIDENCE work`. Exercise all six filters and All, per-role tags, year links, graph click/Enter/Space, desktop and 390/320px layouts. Verify the flower field follows the work layout, that their bottom matches the main content edge, and that the removed cat is absent. Inspect the actual scrolled-to-bottom viewport above the fixed terminal, since a full-page capture can clip an offscreen flower artwork. Observe more than eight seconds of layered flower motion. Verify static reduced motion and hidden-route pause.

## Gotchas

The field remains below the filtered work layout. Desktop uses eleven independently arranged plants drawn from three complete head cutouts from the first approved dotwork study; narrow layouts show six. The SVG field retains the first study’s dotwork silhouettes and numeric centers. The former one-entry blank tail spacer was replaced by the artwork’s natural height. Stem bases finish at the content edge above the fixed terminal. The SVG field resolves its reference image from the script URL. Hidden-tab pausing needs a real visibility test to claim verified; hidden-route checks alone do not prove it.
