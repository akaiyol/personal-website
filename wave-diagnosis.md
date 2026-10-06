# Current wave diagnosis

Status: active coupled-field source inspected and desktop/mobile states sampled on 2026-10-06. Full continuous-cycle review remains outstanding. The approved foam-only reference exposes structural failures beyond missing fine detail.

| Active mechanism | Observed or source-supported problem | Action |
| --- | --- | --- |
| `renderOcean()` water bands, sheet contours, impact fill | Water receives marks despite the foam-only target. | Replace visible-water drawing with explicit foam coverage. |
| `claw()` fixed hook and two forks; every-fourth-point `crown()` placement | Repeated topology yields upright fringes and ornament. | Replace after connected foam studies; do not just add noise. |
| Upward-flipped crown normals | Branches cannot consistently wrap around the lip. | Derive orientation from supporting material and intended curl. |
| Height/rate field with prescribed horizontal flow | Coupling exists, but horizontal momentum and cross-section circulation are not solved. | Evaluate against remaining motion needs in step 4. |
| Instantaneous `strip()` profile and 115-unit/s root motion | Growth and transport are prescribed rather than inherited continuously. | Evaluate tracked-front emission or a different material model. |
| Elevation/rise pressure proxy and launch velocities | Wall eruption is state-triggered, not solved pressure redirection. | Validate boundary causality in the dynamics experiment. |
| Full 1000×320 domain fitted to 360×280 mobile art | Sampled formations look vertically stretched and compressed horizontally. | Preserve display proportions and simplify detail deliberately. |
| Returning particles inject vertical-rate impulses | Real feedback exists; mass and horizontal momentum transfer are unmodelled. | Define transfer budgets and acceptance tests. |

Retain for comparison: seeded math, separate simulation/render modules, fixed-step clock, Braille packing, and existing numerical checks. Baseline copies and hashes: `archive/wave-baseline-2026-10-06/`. Numerical stability does not establish visual success.

# Historical diagnosis — replaced object-wave implementation

**Status: source-based baseline; live visual diagnosis must be refreshed before replacement.** The user's assessment is that the current ocean remains too uniform and mechanical. Do not equate existing numerical checks with natural-looking motion.

| Mechanism                                    | Current source                                           | Consequence and diagnostic question                                                                                                                               |
| -------------------------------------------- | -------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Independent travelling crests                | `createCrest` and `updateOcean` in `ocean/simulation.js` | Each crest owns its speed and position. No neighbouring force modifies its travel. Does the scene read as separate moving objects?                                |
| Scheduled births and fixed initial placement | `nextArrival` and initial positions in `createOcean`     | Random intervals are bounded, but formation is still an external schedule rather than emergence from interacting water.                                           |
| Shared geometric topology                    | `crestGeometry`                                          | Width, height, lean, and curl vary, but every crest retains the same control-point structure. Variation may preserve a repeated emblem.                           |
| Decorative field overlap                     | `waterContour`                                           | Crest envelopes and noise are summed to draw water. There is no stateful transfer of momentum between neighbours. Visual overlap is not physical coupling.        |
| Limited noise influence                      | `crestGeometry` and `waterContour`                       | Noise deforms contours without controlling a collective dynamical system. Determine which variation is visible and which is too weak or structurally constrained. |
| Local collision trigger                      | Leading-face threshold in `updateOcean`                  | Contact clamps a crest and emits an impact. It does not inject a reflected disturbance into the shared ocean state.                                               |
| Separate eruption renderer                   | `drawImpact` in `ocean/render.js`                        | Branches are an age-driven graphic. Check whether the eruption appears connected to the arriving mass.                                                            |
| Drawn recoil                                 | Recoil strokes in `drawImpact`                           | Recoil has no effect on approaching crests; it can look like an overlay rather than backwash.                                                                     |
| Particle return                              | `updateParticles`                                        | Returning droplets create secondary particles, but do not disturb the water field.                                                                                |
| Repeated contour organization                | `drawWater` and `drawCrest`                              | Noise and taper interrupt strokes, but layering and crest topology can still produce regular bands.                                                               |

## Correct the randomness diagnosis

The current code does contain seeded randomness, fBm, noisy contours, and variable parameters. The issue is insufficient structural variation and interaction, not the literal absence of randomness. Adding more independent random numbers will not solve connected motion.

## Live review to complete

Record complete travel/contact/collapse sequences and several successive arrivals. Evaluate scale and spacing, shape recurrence, neighbouring influence, cliff impact, foam, spray, weight, danger, and continuously churning water. Link captures or precise observations to the responsible source mechanism.

## Replacement decisions

Mark each mechanism **remove**, **replace**, or **retain with evidence** after model comparison. Utility code may be retained only if its quality and fit are established. Do not preserve object-based ocean dynamics solely to avoid rewriting them.

Historical implementation and verification notes are in [archive/wave-previous-study.md](archive/wave-previous-study.md). They describe an earlier pass, not acceptance of the current design.

## Baseline rendered confirmation — 2026-10-05

The standalone study shows three similar isolated curled silhouettes and evenly stacked interior ribbons. This confirms the shared-template diagnosis. Their decorative impact cannot modify neighbouring water. Remove the old crest objects, timed arrivals, cubic crest template, impact-age drawing, and drawn recoil. Retain only seeded math and Braille packing as utilities; replace simulation and geometry completely.
