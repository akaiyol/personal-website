# Wave review and iteration

## Active checkpoint — 2026-10-06

- Approved: [static composition](artifacts/references/wave-approved-2026-10-06.png), explicitly confirmed by the user.
- Step 1: specifications reconciled; coupled-field source and earlier screenshot preserved in `archive/wave-baseline-2026-10-06/`.
- Step 2: actual Unicode Braille rendering at desktop/mobile sizes is pending.
- Steps 3–5: deformation, dynamics selection, and full-ocean integration remain pending.
- Approval of the raster does not establish character fidelity or motion.

## Artistic acceptance criteria

- One connected ocean is visible rather than a procession of separate objects.
- Motion is unpredictable but coherent, with meaningful neighbouring influence.
- Major formations emerge through interaction rather than a fixed birth schedule.
- The global flow is clearly rightward while local motion can turn, circulate, or rebound.
- Wave silhouettes are asymmetric and organic, with varied scale, spacing, curvature, and timing.
- Water is already turbulent before contact; it does not simply grow from left to right.
- The cliff visibly compresses incoming water and causes the highest, most forceful eruption.
- Foam, spray, fragments, and falling sheets follow from that event.
- Backwash and secondary disturbances affect approaching water.
- Only foam and spray are purple Braille; sky and unfoamed water remain black. Connected foam patches, uneven downward rakes, layered foam streaks, and the open hollow match the approved reference.
- The result feels angry, dangerous, and heavy; it evokes the emotional energy of _The Great Wave off Kanagawa_.

## Review method

1. Review still compositions for silhouette, hierarchy, negative space, foam structure, and the two-colour rule.
2. Observe complete approach, contact, eruption, flight, collapse, and recoil sequences.
3. Observe several arrivals and longer runs to expose repetitive structures, synchronized behaviour, or resets.
4. Inspect the standalone study and landing-page integration on desktop and narrow screens.
5. Verify usability: readable content, unobscured controls, no layout shifts or horizontal overflow, and a suitable static reduced-motion composition.
6. Check state stability, bounded work, console errors, and hidden-page pausing separately from artistic quality.

## Required response to a failed major criterion

Identify the visible defect and the underlying system causing it. Modify that system, rerun reproducible checkpoints and live sequences, and reassess the whole composition. Do not treat added texture or extra particles as a substitute for solving weak propagation or collision.

Continue until movement, composition, boundary response, and procedural variation collectively satisfy the artistic criteria. “Functioning” and “better than before” are not acceptance criteria.

## Iteration record format

For each meaningful pass record:

- Pass identifier, source revision, seed, parameters, and relevant time/window.
- Question tested and expected visible effect.
- Rendered observations, linked evidence, and verification limits.
- Failed criteria and source-level cause.
- Change made, retest result, and remaining issues.
- Status: failed, needs further review, or meets the stated criteria.

Earlier baseline evidence is historical and remains in [archive/wave-previous-study.md](archive/wave-previous-study.md).

## Historical prototype reviews

The records below predate approval of the foam-only reference. They do not establish acceptance of the new target.

## Current review — 2026-10-06

Replacement model is running and numerically checked for three minutes. Standalone render checkpoints at 5 and 12 seconds show improved asymmetry and spray, but do not yet meet final artistic acceptance. Remaining: stronger overhangs, less parallel interior detail, full impact-cycle and mobile review. Do not describe this pass as a finished piece of art.

## Latest pass review — 2026-10-06

Supersedes the earlier implementation notes above. The current renderer shows irregular multi-scale formation, connected water and strip roots, high-density cliff impact with a curved crown, spray/droplets, and a subsequent return phase. Desktop checkpoints, live landing-page rendering, mobile composition, and reduced-motion output were inspected. Numerical tests cover three minutes; they do not certify artistic quality or exact fluid conservation.

The coarse uniformity, missing impact, numerical drain, detached-root gap, needle-like impact, and triangular spray fan were addressed in the recorded passes. Character resolution still limits fine foam fingers; longer artistic assessment and observed hidden-tab pause remain unverified. No claim of reproducing Hokusai's painting or a complete physical ocean solver is made.

## Reference-driven foam review — 2026-10-06

The current foam pass targets the Hokusai feature map and quality tests in `wave.md`. Dense caps, curved pointed forks, black notches and a clear main hollow replace the earlier thin lip. Interior detail is less prominent, and occasional larger fragments accompany fine droplets. Desktop checkpoint evidence and scoped dot-density measurements are recorded in `wave-process.md`. Sampled live observation spanning more than 60 seconds and native mobile/reduced-motion inspections are recorded there too. The main caps and hollows remain legible, while the finest secondary forks merge on mobile. Further refinement should target that resolution limit rather than increase density across the whole ocean.
