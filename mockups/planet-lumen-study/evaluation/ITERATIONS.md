# Planet evaluation iterations

The goal is defined in [CRITERIA.md](CRITERIA.md). This is an artifact evaluation, not a change to Daphnie’s skills. No user aesthetic acceptance has been recorded. Production remains unchanged.

## Baseline — 3594661

Partly aligned: ringed silhouette, volume, colour, terminal and interaction are present. Repeated rainbow strata look synthetic. Globe and rings use the same spectral mapping. The uniform LED grid competes with natural surface detail. Prior checks did not establish a full rotation or real hidden-tab pause. Using Lumen did not by itself establish reference fidelity.

## Iteration 01 — regional procedural material

Hypothesis: nonrepeating regional pigment, localized vortices and mineral rings would improve naturalness without changing the renderer or movement. Result: less repetitive colour, improved material separation, but surface detail became soft. V2 remained partial. Preserve as `iteration-01.js`; do not promote it as the finished design.

The quick evaluation also found an existing mockup navigation defect: the base URL sent Home links out of the study. The source-based candidate preserves same-document hash links, including phone navigation. The route pause/return check now passes.

## Iteration 02 — source-based candidate

Use a real Voyager/JPL cloud map as structural detail, with expressive grading; retain mineral rings. Source and its limitations are documented in [SOURCE.md](../SOURCE.md). A newer Hubble source was identified but could not be downloaded. This remains a fictional ringed planet, not a scientifically accurate Jupiter.

Matched evidence: `planet-eval-full-02`, baseline revision 3594661, renderer SHA-256 `5010a605904864b432725f4deaadc02dc95e615177f692cce3b5b16fa78fa290`. The machine report records the full hash. Renders: `baseline-prism-{width}.png`, `{material}-{width}.png`; widths 1280, 1470, 390 and 320. `entrance-sheet.png` and `cycle-sheet.png` assemble actual real-time frames; the video retains the continuous run.

| Criterion | Current review | Observation |
|---|---|---|
| V1 Volume | Pass for this candidate | Curved terminator, illuminated limb, ring occlusion and shadows establish depth in resting/entrance views. |
| V2 Natural surface | Partial | Real, irregular cloud structure improves on the procedural rainbow; old 720×360 source and the dot treatment still soften defining detail. |
| V3 Rich colour | Pass for this candidate | Teal, blue, gold, rose and violet with tonal variation; more coherent regions and less cyclic repetition. This is reviewer judgment, not user palette acceptance. |
| V4 Luminous texture | Partial | Dot cores, gaps and localized bloom remain, but the regular screen pattern is still conspicuous at desktop scale. |
| V5 Rings | Pass for this candidate | Mineral material is distinct from the atmosphere; gaps and front/back ordering remain visible. |
| V6 Composition | Pass in inspected Chromium views | Matched foreground bounds and no horizontal overflow for all three materials/four viewports; text and controls remain readable. |
| B1 Interaction | Pass in Chromium | All arrows, both drag directions, hover hint, material selection, route pause and Home return pass. |
| B2 Motion/lifecycle | Partial | Entrance and a full real-time rotation plus continuation recorded and inspected; reduced-motion phase freezes. Real background-tab pause remains unverified. IAB continued reporting `document.hidden=false` when another tab was opened, so that attempt is not evidence of a visibility transition. |
| B3 Rendering health | Observed; no comparative performance verdict | No page errors; 1,136 active frame observations, median 66.6ms and p95 67.7ms between paints on this machine, plus a 91ms startup long task. No equivalent baseline performance run; do not infer a speed improvement or 60fps. |

All 21 automated checks passed in the full run. Automation does not pass the visual rows. Safari, physical touch and user artistic acceptance remain unverified.

## Rejected experiment — tone-dependent halftone

Tested Lumen’s halftone stamp on the same source. It reduced the uniform grid but erased too much of the shadowed hemisphere and weakened ring continuity. Rejected; retained LED stamping. No production code was changed by the experiment.

## Next decision

Current candidate is improved, not finished. Address V2/V4 together: use a cleaner, more detailed source and compare dot scale/coverage at matched overall brightness. Keep the current source-based candidate and baseline visible; do not add more palette variants until material/texture balance is accepted. Reassess the representation if two focused attempts do not improve those criteria. User review determines whether the source-based direction captures the intended feeling.
