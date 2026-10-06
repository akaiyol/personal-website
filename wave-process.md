# Wave research, design, and rebuild procedure

## Current direction — 2026-10-06

Return to focused research and visual validation before further ocean implementation. The current prototype remains a comparison baseline; no Git rollback or replacement solver is selected. The next deliverable is one convincing foam-only Braille formation and a short deformation study, not a complete ocean rebuild.

This sequence supersedes the earlier solver-first plan and the next-step recommendations in the historical records below. Existing research remains evidence to evaluate, not approval to implement its candidates. Complete each checkpoint before dependent work; checkpoints are evidence requirements, not additional permission requests.

## 1. Reconcile the visual specification and baseline

Record the latest visual direction in `design.md` and reconcile `wave.md` and `wave-review.md` with it:

- Background and unfoamed water remain empty black space. Purple Braille represents foam and spray; water volume must be implied by their placement and surrounding negative space.
- Select foam independently. Do not invert the entire reference, fill the sky, or retain generic water-contour bands from the previous treatment.
- Preserve the supplied reference's broad asymmetric base, overhanging crest, clustered small rakes, unequal branches, overlapping secondary formations, and substantial open hollows.
- Distinguish foam patterns on a broad water sheet from foam-covered water ligaments. A visible foam branch does not necessarily require a separate branch of fluid.
- Replace the foam-to-water dot-occupancy ratio with checks for empty unfoamed regions, readable foam structure, connected patches, separated tips, and preserved hollows.

Refresh `wave-diagnosis.md` against the active coupled-field prototype; label the replaced object-wave diagnosis as historical. Record repeated claw topology, upward-oriented fringes, contour bands, prescribed strip launches, wall-response proxies, and mobile aspect distortion as the current issues to investigate. Keep findings separate from proposed fixes.

Preserve baseline code and reference captures before replacement. Retain seeded replay, separate simulation/render responsibilities, fixed-step timing, and Braille conversion where verified useful. Visual rules belong in `design.md`, behaviour in `wave.md`, research in `wave-research.md` and `wave-mathematical-research.md`, architecture decisions in `wave-architecture.md`, and acceptance evidence in `wave-review.md`.

**Checkpoint:** active specifications consistently describe foam-only Braille. The baseline and its limitations are identifiable, and no candidate solver is presented as selected.

## 2. Validate one static formation in actual Braille

Use the supplied Braille formation and Hokusai reference to study the relationship between the rising mass, forward-reaching crown, foam patches, and hollow. Use Shan, Shui for procedural composition and correlated variation; do not treat landscape generation as evidence of fluid behaviour.

Build a bounded static study at the actual desktop and mobile character sizes. Establish branch thickness, gap width, curvature, density, patch connectivity, and the amount of visible foam needed to imply otherwise invisible water. Study broad bases, unequal crowns, interlocking layers, and clusters of small rakes rather than distributing detail uniformly.

Inspect native Braille output, not only a high-resolution drawing buffer. Define responsive framing that preserves the intended proportions rather than compressing the entire simulation domain into a narrow frame. Mobile may simplify fine branches while retaining the crown, base, and open hollow.

**Checkpoint:** one formation reads as substantial asymmetric water through foam alone at both sizes. The background and unfoamed water contain no marks; tips and gaps remain distinct. Reject loops, thin ribbons, comb-like fringes, and disconnected ornament. Static acceptance establishes appearance only, not motion.

## 3. Validate a short deformation sequence

Animate a bounded study through connected growth, curling, narrowing, and detachment. Foam must remain associated with its supporting surface; detached material must inherit motion. Branch structure should deform continuously rather than repeat a stamped hook with altered dimensions.

Separate four possible failure sources: material motion, surface reconstruction, foam placement, and Braille sampling. Use diagnostic water geometry to inspect continuity even though water remains invisible in the final presentation. Do not require every foam pattern to become a separate fluid ligament.

Test whether details remain coherent while crossing the Braille dot grid. Compare attached and detached states, root continuity, gap preservation, and the transition into the next formation. Observe the complete sequence at desktop and mobile sizes; a flattering still is insufficient.

If evaluating isotropic versus anisotropic reconstruction, use identical particle trajectories. Reconstruction may preserve existing thin features; it cannot generate missing dynamics. Reject false bridges between detached drops and smoothing that closes intended hollows. Do not add a particle solver solely to perform this comparison before establishing its need.

**Checkpoint:** the accepted shape language survives motion and native-resolution sampling. Growth, curl, thinning, detachment, and subsequent movement remain understandable without repeated ornaments or frame-to-frame sparkling. Document any unresolved mechanism before advancing.

## 4. Select the dynamics experiment from remaining requirements

Use the preceding studies to determine what the motion model must supply. Compare a repaired reduced hybrid with side-view PIC/FLIP against the actual unmet requirements, including overturning, neighbouring influence, local circulation, and wall response. Neither candidate is approved by this process update.

Research and define:

- Sustained directional forcing, inlet conditions, wall geometry, return flow, and how repeated arrivals avoid uncontrolled water accumulation.
- Continuously emitted connected sheets and inherited local velocity if pursuing the hybrid; particle/grid transfers, pressure projection, boundaries, and surface reconstruction if pursuing PIC/FLIP.
- Surface-foam generation, transport, persistence, and breakup separately from airborne spray.
- Browser and mobile budgets, timestep sensitivity, bounded state, and the quantities conserved or approximated. Measure volume drift and divergence where applicable.

Record the selected experiment, alternatives, assumptions, causal relationships, and failure criteria in `wave-architecture.md`. Pin source revisions and verify licences before adapting external code. Keep existing numerical checks separate from visual acceptance.

**Checkpoint:** evidence supports a bounded dynamics experiment capable of the missing behaviour at the required display resolution and runtime cost. A more sophisticated solver is not accepted merely because it is more physically detailed.

## 5. Integrate the cliff and full ocean after the studies pass

Integrate the validated motion and foam treatment in reviewed stages. Preserve global rightward travel and an already turbulent approach. Require wall contact to redirect arriving motion into the tallest eruption, followed by outward spray, falling water, recoil, and disturbance of incoming water. Events must overlap without a scene reset.

Review the connected composition, irregular hierarchy, force, and negative space throughout approach, contact, breakup, return, and the next arrival. Test at least three distinct arrivals and a 60-second run, with reproducible seeds and comparable checkpoints. Inspect both the standalone study and landing-page integration on desktop and narrow screens.

Verify native Braille legibility, responsive proportions, readable page content, unobscured controls, keyboard access, no horizontal overflow or layout shifts, reduced-motion presentation, and observed hidden-page pausing. Run appropriate numerical and runtime checks separately.

**Checkpoint:** the full ocean preserves the validated foam-only visual language and demonstrates the specified causal motion across complete sequences. Record failures by responsible system; do not compensate for weak dynamics with extra dots or claws. Return to the relevant earlier stage when a major criterion fails.

## Evidence and acceptance

For each meaningful study, record the source revision or snapshot, seed, parameters, viewport, question tested, rendered evidence, failed criteria, and next action in `wave-review.md`. Distinguish confirmed observations, proposals, and unverified behaviour.

Baseline assessment on 2026-10-06: the existing 180-second numerical checks passed stability, deterministic replay, bounded secondary state, impact occurrence, and neighbour response. Desktop/mobile visual inspection was sampled, not a continuous full-cycle review. Those results justify retaining the prototype for comparison; they do not establish artistic acceptance.

Completion requires both the requested appearance and verified motion. Passing code checks or improving on the previous version is insufficient.

## Historical records

The entries below preserve previous research and implementation evidence. Their visual rules, acceptance claims, and next-step recommendations are historical and do not override the active sequence above.

## Research update — 2026-10-05

- Compared procedural landscape composition, analytical ocean surfaces, FFT implementations, shallow-water solvers, and connected breaking sheets using primary sources. Findings and equations are in `wave-research.md`.
- Confirmed black/purple palette; high energy must appear through dense Braille, not white or blue.
- Main diagnosis remains: independently spawned crest shapes cannot transmit impact or backwash through neighbouring water.
- Next priority: record a bounded numerical architecture, replace obsolete dynamics, and review actual motion. No new animation has been accepted in this research pass.

## Implementation iterations — 2026-10-06

### Pass 1: replace object waves with shared field

- Removed the timed crest objects, shared cubic crest template, impact-age graphics, and decorative recoil from the active simulation/render modules. Retained seeded math and Braille packing.
- Added neighbouring displacement/rate coupling, directional transport, correlated multiscale swell, front-derived connected strips, and particles that return impulses to the field.
- Rendered result: unequal pointed swells, but no reliable impact. A 90-second check recorded zero collisions. Largest problem: boundary energy was not producing contact.

### Pass 2: boundary response and feedback correction

- Added contact energy from near-wall incoming state and energy-dependent upward sheets. Added sustaining forcing; corrected repeated deposition from already-returned strip nodes. Reduced feedback impulse scale to prevent a numerical drain.
- Rendered at 5 seconds: curling strips and visible right-side spray. At 12 seconds: spray separated too quickly and rose out of the frame. Largest problem: impact lost connection and weight.

### Pass 3: keep impact attached; strengthen water hierarchy

- Kept the base of impact strips attached during compression, reduced launch velocity, increased high-energy stroke thickness, and retained more broken interior marks. Reduced clipping of troughs and increased nonlinear propagation variation.
- Three-minute numerical run: finite field and strip state, bounded counts, exact seeded replay, and nonzero neighbouring response to a local impulse. This establishes numerical behavior, not artistic completion.
- Remaining visual issues: curls are still too small relative to the primary swell; some interior ribbons remain visibly parallel; impact sheet roots need a stronger compression silhouette.
- Next priority: review a full impact cycle and revise strip generation/field steepening until the overhang and collision read as heavy water. Mobile and final aesthetic acceptance remain pending.

### Pass 4: larger breaking sheets and root continuity

- Replaced small initial sheet humps with ballistic connected profiles, bounded by available headroom. Suppressed neighbouring duplicate strips. Kept visible roots connected when intermediate particles rejoin the surface.
- Added interior marks following the actual strip deformation and more correlated variation inside the shared water body.
- Review found broader curls, but cliff sheets still read as thin needles or triangular fans. Next priority was mass and a curved collision crown.

### Pass 5: impact mass and crown

- Rendered the actual impact strip envelope with sparse interior Braille and denser edges. Increased lateral spread and changed the launch profile: near-cliff water rises higher, outer water falls back sooner. Pressure release and rising-state detection replaced persistent threshold-only firing.
- Reviewed later contact and return phases at 18.8 and 20 seconds, plus earlier checkpoints. The impact now reads as a water mass with a hollow and spray rather than an isolated column.
- Remaining issue: fine swell was disappearing over time, leaving rolling undulations between impacts. Next priority was sustained multi-scale forcing.

### Pass 6: sustain the churning ocean

- Added a fifth scale and a forcing term derived from the material acceleration and Laplacian of the correlated swell target. This keeps fine formation active while local deviations still propagate through the actual shared field. Corrected initial material rate and inlet sampling to avoid double transport.
- Reviewed the revised 18.8-second state, the landing page, and the reduced-motion composition. The ocean retains several asymmetric scales and connected breaking/impact geometry.
- `node scripts/check-ocean.mjs` passes 180-second finite-state stability, deterministic replay, bounded secondary water, nonzero cliff impact, and neighbour propagation. Browser error logs were empty in reviewed pages.
- Reviewed mobile composition at 390×844; desktop view restored afterward. Reduced-motion preview is an actual deterministic simulation state, without forced crest repositioning.
- Artistic review: current pass has substantially different formation sizes, persistent churn, connected roots, a dense curved impact crown, airborne droplets, and returning disturbance. Fine hooked foam detail remains constrained by character resolution; hidden-tab suspension has code coverage by inspection but has not been observed in this browser. These are limits of verification, not claims of full fluid accuracy.
- Next highest-priority refinement if a later visual review finds weakness: strengthen local overturning and foam fragmentation through strip dynamics, preserving shared-field feedback.

## Hokusai foam and contrast refinement — 2026-10-06

### Pass 7: map the reference and build foam shapes

- Visually inspected The Met's public-domain image of the print. Added the feature map and explicit native-resolution, density, shape, temporal, variation and responsive tests to `wave.md`.
- Diagnosed the current gap: foam appeared as thin contours and scattered drops, with no substantial forked crown; many interior ribbons competed with crests.
- Added connected dense caps with tangent/normal-derived, tapered branching geometry on active breaking sheets. Added persistent material indices and birth seeds so branches follow the same water elements over time.
- Reduced interior line count from 17 to 10 and lowered interior dot coverage. This changes spatial density, not the black/purple palette.
- First desktop inspection at 5.5 seconds: foam increased, but closely spaced forks merged into an upright fringe. Needed fewer, clearer major claws and stronger hook curvature.

### Pass 8: sculpt tips, preserve gaps, retain weight

- Curved the major fingers back toward the crest, curved secondary forks, spaced major roots farther apart, and bounded their extension by available headroom. Retained visible sparse water contours after the first pass made them too faint.
- Added a skewed fragment-size distribution and heavier droplet marks, producing occasional larger foam fragments among small spray instead of increasing all particle counts.
- Desktop checkpoint at 5.5 seconds: broad crown with separated pointed forks and an open black hollow. At 18.8 seconds: a different crown and taller boundary foam region, with falling fragments and retained black gaps.
- Measured the rendered Braille at the 5.5-second checkpoint: a 100×50 world-unit cap window `(500,35)` had 56.5% dot occupancy; the same-size water-interior window `(370,205)` had 2.7%. This is a scoped density measurement, not a universal contrast certification. It exceeds the specified 2:1 occupancy threshold.
- `node scripts/check-ocean.mjs` passes the 180-second state, deterministic replay, bounded-work, impact and neighbour-propagation checks. Those checks do not establish artistic quality.
- Final review: sampled the live study over more than 60 seconds, including changing crest crowns, detached fragments and boundary spray. Inspected the landing page at a 390×844 viewport and the mobile reduced-motion study: copy remains unobscured, the dominant crowns and black hollows remain visible, and the finest forks merge at this resolution. Browser error logs were empty. This is sampled visual evidence, not a continuous video review.
- Remaining limitation and next priority: small secondary forks lose definition on mobile; refine their scale and spacing if finer detail is needed. Preserve the open hollows and two-colour palette.

## Finger integration research checkpoint — 2026-10-06

- Moved the detailed finger-integration proposal into the canonical `wave-research.md`: primary sources, code adaptations, limitations, mathematical thickness proposal and quality tests.
- Linked the candidate from `wave-architecture.md`; retained a pointer in `wave-mathematical-research.md` instead of duplicating the research.
- Next experiment: compare anisotropic and isotropic surface reconstruction with identical material motion, then assess roots, stretching, breakup and Braille legibility.
- No solver choice approved and no animation code changed. Static sketches are reference studies, not evidence that material continuity works in motion.
