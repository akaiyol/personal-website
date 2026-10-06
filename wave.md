# Wave project brief

## Status and document map

**Phase: reference approved; native Braille and motion studies pending.** Follow the gates in `wave-process.md`. The coupled-field prototype is preserved in `archive/wave-baseline-2026-10-06/`; no replacement solver is selected. The [approved composition](artifacts/references/wave-approved-2026-10-06.png) establishes visual direction, not procedural or motion acceptance.

| File                                                             | Purpose                                                        |
| ---------------------------------------------------------------- | -------------------------------------------------------------- |
| [design.md](design.md)                                           | Visual rules, references, composition, and emotional character |
| [wave-research.md](wave-research.md)                             | Source-backed procedural-art and wave-model research           |
| [wave-diagnosis.md](wave-diagnosis.md)                           | Current implementation's structural weaknesses                 |
| [wave-architecture.md](wave-architecture.md)                     | Candidate systems, state ownership, coupling, and tuning       |
| [wave-process.md](wave-process.md)                               | Ordered procedure and evidence required at each stage          |
| [wave-review.md](wave-review.md)                                 | Artistic and motion acceptance criteria; iteration record      |
| [archive/wave-previous-study.md](archive/wave-previous-study.md) | Historical specification and previous verification claims      |

## Objective

Create a connected, continually reorganizing ocean that feels angry, violent, heavy, chaotic, and coordinated. Use Hokusai's _The Great Wave off Kanagawa_ as the primary visual and emotional reference. Study Lingdong Huang's _Shan, Shui_ for procedural philosophy rather than its landscape aesthetic.

Natural variation must emerge from interacting water, correlated randomness, and several spatial and temporal scales. Independently translating wave objects with cosmetic noise do not satisfy the objective.

## Motion requirements

- Maintain global rightward transport with local circulation, interference, and unpredictable deviations.
- Keep water already churning before contact. Do not create a simple left-to-right growth gradient.
- Allow several small disturbances to combine into a dominant formation, then reorganize or partially flatten over time.
- A disturbance must influence neighbouring water. Large formations should draw surrounding motion into them.
- Support asymmetric bases, steep faces, temporary curls, overhangs, hooked tips, foam fingers, and trailing secondary peaks.
- Treat the right boundary as a hard cliff. Compression and upward momentum redirection produce the tallest, most forceful event.
- Follow impact with breakup, airborne spray, falling droplets, dispersing foam, backwash, and secondary disturbance of incoming water.
- Overlap events rather than resetting the scene between crashes.

The intended sequence is: mass gathers and accelerates within an already turbulent ocean → rises and curls → compresses at the cliff → erupts → fragments and sprays → falls and disperses → surrounding water reacts → another irregular system emerges.

## Variation requirements

Vary wavelength, amplitude, height, sharpness, width, spacing, propagation speed, phase, local direction, foam density, turbulence, spray, impact strength, and formation timing. Large structures vary slowly; small details respond faster. Preserve continuity and causal relationships rather than selecting unrelated random values everywhere.

Use seeded randomness during development for reproducible diagnosis. A reproducible process can still produce an evolving scene without a visible short loop. Determinism itself is not a visual defect; mechanical repetition is.

## Cliff, foam, and spray requirements

- Derive impact intensity from arriving motion and energy, not an unrelated timer.
- Vary crash height, spread, duration, fragment sizes, spray density, and secondary turbulence through the incoming state and correlated variation.
- Foam identifies breaking, compression, and energetic turbulence. It follows the water and disperses over time.
- Spray and droplets retain state, inherit launch momentum, follow trajectories, and return energy or disturbance to the water.
- Rebound and backwash must interact with approaching water, not merely appear as drawn lines.

## Rendering constraints

Follow [design.md](design.md): purple `#C5B5EC` Braille on black `#000000`, with no other displayed colours or opacity shades. Render only foam and spray. Background, unfoamed water, and the main hollow remain unmarked black. Use connected foam patches and broken foam streaks to imply the water mass; do not draw generic water-contour bands.

The palette is confirmed: black and purple only. The pasted brief's white/blue instructions are superseded. Express hierarchy within the foam through patch geometry, dot density, and negative space. Do not invert the entire reference.

## Decision discipline

Research findings, hypotheses, candidate models, and chosen decisions must be labelled separately. No mathematical model is selected by this document. Complete research, diagnosis, model comparison, and architecture before replacement implementation.

Delete obsolete wave code during the replacement stage after the diagnostic evidence has been recorded. Do not keep a weak mechanism simply because it already exists. Preserve the small amount of historical documentation needed to explain the decision.

## Quality target

The result must convincingly read as a raging connected ocean crashing against a cliff. Review every meaningful pass visually across complete motion sequences. Passing syntax checks, adding noise, or being better than the previous version is insufficient. Use [wave-review.md](wave-review.md) to identify the underlying cause of failed criteria and iterate.

## Hokusai feature map and foam refinement — 2026-10-06

Reference: [The Met, The Great Wave](https://www.metmuseum.org/art/collection/search/45434), [museum image](https://collectionapi.metmuseum.org/api/collection/v1/iiif/45434/134438/main-image). The observations below are visual analysis of this image; the animated cliff collision is our adaptation.

| Defining feature observed                        | Translation into our black/purple ocean                                    |
| ------------------------------------------------ | -------------------------------------------------------------------------- |
| A dominant hooked crest encloses a broad hollow. | Keep a legible black cavity beneath the largest overturning sheet.         |
| Thick foam crowns divide into claw-like fingers. | Generate connected caps with unequal, tapered, forked tips.                |
| Sharp cusps alternate with rounded lobes.        | Combine curved roots with pointed ends and deep black notches.             |
| Small foreground crests echo the large wave.     | Repeat the shape language at several scales without identical silhouettes. |
| Pale foam contrasts with dark striped water.     | Purple foam patches on invisible black water, with clean black gaps.             |
| Droplets separate from larger foam structures.   | Retain clumps and sheets before dispersing into smaller droplets.          |

### Refinement requirements

- Foam must read as a **shape**, not just a thicker line or additional random dots. At peak energy, build broad joined caps, irregular lobes, narrowing fingers, secondary forks, and detached fragments.
- Attach the main cap to the deforming crest. Derive its tangent, outward normal, branching direction, and activation from the surface or breaking-sheet state. Keep branch variation correlated and stable across frames.
- Use several scales: one major crown, fewer medium claws, and smaller torn tips. Their size and spacing must be unequal; avoid comb teeth, flower petals, stars, and repeating icons.
- Preserve the rising body, steep front, overhanging lip, and black hollow as distinct parts of a dominant formation. Do not fill the hollow with spray noise.
- Increase contrast through geometry and dot occupancy, using only the existing purple and black. Energetic foam roots may approach fully occupied Braille cells; unfoamed water must remain empty. Keep local black separations between branches.
- Pointed edges should taper to a visible tip; rounded roots should have weight. More foam should not flatten every region into a uniformly dense carpet.
- Keep the highest collision eruption and largest foam concentration near the right boundary. Allow some foam to remain on upstream breaking fronts and in returning water.

### Quality tests and acceptance evidence

Use seed `270627` and preserve comparable before/after checkpoints. Check approach, peak contact, airborne breakup, return, and the transition into the next formation. Inspect at least three different arrivals and a 60-second run; do not select only a flattering still.

| Test                              | Pass criterion                                                                                                                           | Failure requiring another refinement                                                        |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Silhouette at normal display size | A rising face, overhang, pointed crest and black hollow are identifiable without zoom.                                                   | Rounded hill, isolated arc, umbrella, or a procession of emblems.                           |
| Foam structure                    | Peak crowns show broad connected roots and at least three unequal, legible forks on desktop; mobile retains a crown with separated tips. | Thin outline, uniform spikes, disconnected confetti, or unbroken blob.                      |
| Foam-only coverage                  | Only labelled foam/spray regions contain dots; dense roots and sparse torn edges remain distinguishable.                              | More density everywhere, leaving no hierarchy.                                              |
| Negative space                    | Black notches separate neighbouring foam fingers; the main hollow remains open at peak.                                                  | Foam erases cavities or adjacent forms merge into mush.                                     |
| Edge definition                   | Major tips and boundaries remain distinguishable at native character resolution.                                                         | Detail exists only in the hidden drawing buffer or when zoomed.                             |
| Temporal coherence                | Caps follow the crest, branches deform continuously, fragments detach and fall.                                                          | Per-frame sparkling, fixed stamped decoration, or a cap sliding independently.              |
| Motion and causality              | Contact transforms arriving water into an upward crown and spray; return disturbs the shared field.                                      | A decorative burst unrelated to the incoming formation.                                     |
| Variation                         | Three arrivals differ in crest outline, crown width, fork spacing and fragmentation.                                                     | Same foam emblem with a different size or position.                                         |
| Page integration                  | Inspect desktop and 390×844 mobile, including peak impact and reduced motion; content stays readable and no horizontal overflow occurs.  | Artwork obscures controls, clips major shapes unintentionally, or produces layout movement. |
| Runtime                           | Run `node scripts/check-ocean.mjs`, inspect console errors, and retain fixed-step timing and bounded state.                              | Numerical stability is used as a substitute for visual acceptance.                          |

Check empty sky, the open hollow, and unfoamed water regions against the actual Braille string. Do not use a foam-to-water occupancy ratio: water has no marks in the approved treatment. Record sample windows and distinguish sampling loss from incorrect foam placement.

Record changed systems, rendered observations, failed tests, and next priority in `wave-process.md`. Capture the reference and the output side by side during review. Keep artistic interpretation separate from physically validated behaviour.
