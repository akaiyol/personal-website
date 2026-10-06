# Wave review and iteration

## Active checkpoint — 2026-10-06

- Approved: [static composition](artifacts/references/wave-approved-2026-10-06.png), explicitly confirmed by the user.
- Step 1: specifications reconciled; coupled-field source and earlier screenshot preserved in `archive/wave-baseline-2026-10-06/`.
- Step 2: static Unicode Braille translation inspected at 1280×1000 and 390×844; broad shape and hollow retained.
- Step 3: prescribed deformation probe implemented; breakup requirements not met. Steps 4–5 remain pending.
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

## Static sampling and deformation checkpoint — 2026-10-06

Source: `studies/foam-static.html`, `studies/foam-deformation.html`, shared `studies/foam-static.js`. Input is the approved raster; these studies do not claim procedural foam generation. No random seed is used.

- Desktop: 220×73 Unicode Braille cells at a 1280×1000 viewport; mobile: 144×48 cells at 390×844. Display aspect remains 3:2. Background and water are blank; the broad base, downward fingers, layered foam and hollow remain readable. Fine mobile gaps simplify and dense roots read more solidly than the raster.
- Original project-owned `WaveBraille-Regular.ttf` defines all 256 patterns with only active dots. U+2800 is empty. System fallback experiments were faint or exposed inactive-dot outlines in bold; those treatments were removed. The font source is `scripts/build-braille-font.py` and requires fontTools only for rebuilding.
- Sampling: binary source mask uses red >70; dot activation uses area coverage >=0.16. Text and background colours remain exactly the approved CSS colours. Source antialiasing is not copied into the palette.
- Inspected deformation states at 0, 2, 4, 6 and 8 seconds, including the loop endpoint. The 0/8-second character strings were identical. Play/pause and keyboard Home scrubbing worked. Mobile controls fit with no horizontal overflow; browser error logs were empty.
- This was sampled inspection, not continuous video verification. Reduced-motion and hidden-page handling exist in source but have not been observed in this pass. Do not mark full motion acceptance passed.
- **Failed step-3 criteria:** the smooth coordinate warp bends existing patches; it does not create connected growth, thinning, material detachment or fragment velocity. It is retained only as a sampling/shape probe and must not become the production ocean model.
- **Next experiment:** represent connected foam patches on supporting material, with persistent identities, narrowing roots, explicit splitting and inherited motion. Evaluate the same Braille renderer before selecting a full dynamics model. Do not extend the coordinate warp to imitate breakup with disappearing dots.

Evidence: [desktop static](artifacts/study-2026-10-06/wave-static-desktop.jpg), [desktop Braille text](artifacts/study-2026-10-06/wave-static-desktop.txt), deformation frames [0](artifacts/study-2026-10-06/wave-motion-0.jpg), [2](artifacts/study-2026-10-06/wave-motion-2.jpg), [4](artifacts/study-2026-10-06/wave-motion-4.jpg), [6](artifacts/study-2026-10-06/wave-motion-6.jpg), and [mobile deformation](artifacts/study-2026-10-06/wave-motion-mobile.jpg).
