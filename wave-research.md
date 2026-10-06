# Wave research

## Current applicability — 2026-10-06

The user approved `artifacts/references/wave-approved-2026-10-06.png`. Follow `wave-process.md`: static native Braille, then deformation, then dynamics selection. Earlier solver-first recommendations below are historical candidates, not the next action. References to visible water contours are superseded: only foam/spray is drawn. Research must distinguish material motion, reconstruction, foam placement, and character sampling. Approval of the image does not select a solver.


Latest diagnosis and mathematical shortlist: [wave-mathematical-research.md](wave-mathematical-research.md), 2026-10-06. This reassesses the implemented hybrid, maps primary sources to current functions, and compares a repaired hybrid with side-view PIC/FLIP. Its recommendation is a candidate, not a replacement architecture decision.

**Status: primary-source research recorded; implementation experiments pending.** Findings below distinguish source mechanisms from proposed adaptations. Palette confirmed: black and purple, with energy expressed through dot density.

## Representation finding — 2026-10-06

The connected ligament diagnostic fails before detailed fluid selection: its initial thick centerline arc cannot express the approved broad foam patches, and elastic motion detaches the crown largely intact. Numerical splitting alone does not close the visual gap. See `wave-review.md` for reproducible evidence.

Next bounded research question: can a two-dimensional supporting patch carry independently defined foam coverage through deformation and local separation while preserving the approved composition? This is a proposed experiment, not a selected solver. Separate surface area/thickness, foam coverage and detached spray state. Require a matching static formation first; then assess local deformation and breakup with persistent material coordinates. Reject the candidate if it behaves as cloth, collapses the hollow, or requires stamping new decorative fingers. Do not proceed to full ocean integration or choose PIC/FLIP merely because these reduced candidates failed.

## 1. Study Shan, Shui

Primary source: [Lingdong Huang's shan-shui-inf repository](https://github.com/LingDong-/shan-shui-inf).

Obtain a read-only research checkout and record its revision and licence. Trace the code from seeded input through generated structure, stroke geometry, layering, spatial progression, and rendering. Inspect the source as well as the output.

| Topic                                | Questions to answer from source                                                                                                    |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| Randomness and controlled randomness | What is seeded? Which distributions and bounds are used? Where are values stored versus regenerated?                               |
| Noise                                | Which functions, scales, octaves, and correlations are used? How do neighbouring samples relate?                                   |
| Organic mathematics and geometry     | How are silhouettes, curves, strokes, taper, and irregular edges constructed?                                                      |
| Parameter variation                  | Which parameters vary together, independently, or within structural constraints?                                                   |
| Layering and composition             | How are foreground/background, overlap, negative space, density, and placement coordinated?                                        |
| Repetition                           | Why do repeated trees, mountains, or strokes avoid obvious duplication? Which limitations remain?                                  |
| Spatial progression                  | How are scene generation, chunk boundaries, continuity, and scrolling coordinated? Distinguish spatial progression from animation. |
| Local and global structure           | Which global rules constrain local variations into a coherent composition?                                                         |

For each finding record the source file/function or line reference, mechanism, visual consequence, proposed ocean adaptation, and limitations. Do not claim the landscape source supplies fluid interaction or cliff collisions without evidence.

### Findings to produce

1. **Adapt:** techniques that support coherent variation, organic geometry, layering, and compositional control.
2. **Do not copy:** mechanisms tied to static landscapes, mountain/tree silhouettes, scrolling presentation, or an incompatible rendering/palette.
3. **Add for this ocean:** stateful propagation, neighbouring interaction, breaking, boundary response, energy transfer, foam transport, airborne spray, and return flow.

## 2. Compare mathematical motion models

Research candidates using primary documentation, papers, or source. Define each model's state, equations, assumptions, limitations, and suitability for stylized Braille output.

| Candidate family                               | Assess                                                                                                              |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Layered sine waves and phase relationships     | Irregular interference and rightward transport; limits on overturning and interaction                               |
| Gerstner waves                                 | Horizontal displacement, sharp crests, and parameter limits; whether neighbouring influence is actually represented |
| Coupled oscillators and spring-like neighbours | Disturbance propagation, damping, stability, and collective behaviour                                               |
| Travelling wave equations                      | Boundary conditions, reflection, and secondary propagation                                                          |
| Displacement, velocity, and force fields       | Transport, convergence, circulation, and a connected evolving state                                                 |
| Perlin/Simplex noise and fBm                   | Correlation across space/time and separation of large and small scales                                              |
| Domain warping                                 | Organic distortion without temporal popping or detached decoration                                                  |
| Turbulence                                     | Stylized local deviations consistent with the global flow                                                           |
| Particles                                      | Foam/spray transport and return to the ocean; limits of disconnected particles                                      |
| Collision impulses                             | Energy-dependent compression, upward redirection, reflection, and backwash                                          |

A combination may be appropriate. More techniques do not automatically produce a better result. Identify which mechanism supplies collective motion and which only supplies visual detail.

## 3. Reference analysis

Study _The Great Wave off Kanagawa_ for asymmetry, weight, dramatic curvature, hollow space, hooked foam, hierarchy, and opposing scales. Separate observations of the still painting from proposed animated interpretations.

Translate blue-water/white-foam contrast into the approved purple/black density hierarchy. Research must not silently override `design.md`.

## Research completion evidence

- Source revision, provenance, and primary references recorded.
- Relevant source systems explained rather than merely named.
- Adapt/reject/add findings completed.
- Candidate models compared for interaction, visual expressiveness, controllability, cost, and numerical stability.
- Claims clearly distinguish observed mechanisms, inferred applicability, and untested proposals.
- Findings linked into `wave.md` and the architecture decision record.

## Completed source study — 2026-10-05

### Shan, Shui: composition rather than fluid mechanics

Read-only checkout: `/tmp/yolanda-shan-shui-research`; revision `9f754d2b2e73495db7883d4d4055a7b0903b0454`; MIT, copyright 2018 Lingdong Huang. [Source](https://github.com/LingDong-/shan-shui-inf).

The inspected `index.html` implements seeded randomness (lines 1–60), octave noise (85–201), weighted selection (`wtrand`, about 426), tapered noise-modulated stroke widths (`stroke`, 516–580), closed irregular contours (`blob`, 580–645), nested mountain layers (`mountain`, about 1804), placement exclusion and occupancy (`mountplanner`, about 3710), and lazy spatial chunks with painter ordering (`chunkloader`, about 3874).

**Adapt:** correlated stroke thickness, bounded weighted variation, nested scales, selective detail, and global placement constraints. **Reject:** scrolling chunks as a model of time, mountain silhouettes as waves, and independently generated objects as water. **Add:** persistent momentum, neighbouring influence, boundary reflection, breaking, and returned-water feedback. These are our proposed adaptations; Huang's landscape generator does not provide those dynamics.

### Mathematical and implemented ocean references

| Primary reference                                                                                                                                          | Verified mechanism                                                                                                                   | Application and limitation                                                                                                                                                           |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [Mark Finch, GPU Gems chapter 1](https://developer.nvidia.com/gpugems/gpugems/part-i-natural-effects/chapter-1-effective-water-simulation-physical-models) | Summed periodic components; related wavelength/amplitude/speed/direction; Gerstner horizontal displacement sharpens crests.          | Useful initialization and directional swell. Analytical geometry alone does not give local impact feedback; excessive steepness produces loops.                                      |
| [Tessendorf, Simulating Ocean Water](https://jtessen.people.clemson.edu/reports/papers_files/coursenotes2002.pdf)                                          | Canonical spectral ocean reference, linked by the inspected implementations below. Full PDF fetch failed during this research pass.  | Do not claim a full paper review. Spectral comparisons below rely on inspected implementation documentation.                                                                         |
| [gasgiant/FFT-Ocean](https://github.com/gasgiant/FFT-Ocean)                                                                                                | Unity FFT ocean prototype; MIT. Author explicitly labels it unsuitable for production and links a newer unfinished version.          | Implementation reference for spectral swell, not evidence of cliff collision or a complete breaking solver. No code installed or executed.                                           |
| [Antonio S. P. Gomes, UnityOcean](https://antoniospg.github.io/UnityOcean/OceanSimulation.html)                                                            | Author explains FFT synthesis from a statistical ocean spectrum, tiling, and foam rendering.                                         | Broad scale interference is useful; tiled geometry and rendering foam do not establish momentum exchange at a cliff.                                                                 |
| [Thürey et al., Real-time Breaking Waves for Shallow Water Simulations](https://matthias-research.github.io/pages/publications/breakingWaves.pdf)          | Detect steep advancing fronts; generate connected particle sheets; absorb returning sheets into the water, producing drops and foam. | Closest structural fit for a compact stylized ocean. Heightfield alone cannot overturn. A reduced side-view adaptation is a proposal, not a reproduction of the paper's full solver. |
| [Chentanez and Müller, Large Bodies of Water with Small Scale Details](https://matthias-research.github.io/pages/publications/hfFluid.pdf)                 | Primary reference for coupling large-scale heightfield water with finer fluid detail.                                                | Relevant architecture reference; detailed numerical method has not yet been audited for this project.                                                                                |
| [Stephen Thompson, Shallow Water Demo](https://www.solarflare.org.uk/shallow_water)                                                                        | GPU heightfield solver using Kurganov–Petrova; source available. Author documents both efficiency and spiky artifacts.               | Demonstrates collective flow. Explicitly cannot represent overturning and complex spray by itself.                                                                                   |
| [Sebastian Lague, Fluid-Sim](https://github.com/SebLague/Fluid-Sim)                                                                                        | Author's particle-based fluid project.                                                                                               | Candidate for full local fluid interaction; source mathematics not audited here. Do not assume disconnected decorative particles are equivalent to interacting fluid particles.      |

### Equations and functions to evaluate

Definitions: `x` is horizontal position, `t` time, `η` surface displacement, `u` horizontal velocity, `h` water depth, `g` gravity, `c` propagation speed, `γ` damping, and `F` forcing. These are model equations, not yet a promise of exact implemented physics.

1. **Directional superposition:** `η(x,t) = Σ A_j cos(k_j x − ω_j t + φ_j)`. Incommensurate wavelengths and correlated amplitude envelopes reduce visible recurrence. Superposition gives interference, but no collision response by itself.
2. **Gerstner displacement:** `X = x − Σ Q_j A_j sin(θ_j)`, `Y = Σ A_j cos(θ_j)`, with `θ_j = k_j x − ω_j t + φ_j`. Bound `Σ |Q_j A_j k_j| ≤ 1` to avoid self-folding. This sharpens geometry; it does not simulate breaking.
3. **Coupled wave field:** `D_t η = v`, `D_t v = c² η_xx − γv + F`, where `D_t = ∂t + U∂x` and `U` is transport. Adjacent samples exchange disturbances through the Laplacian. A reflecting boundary and local impulses are possible. Linear propagation needs an additional steepening/breaking mechanism.
4. **Shallow water:** `h_t + (hu)_x = 0`, `u_t + u u_x = −gη_x`. Height and momentum evolve together. Suitable for compression and return flow, but depth averaging excludes overturning. Use a positivity-preserving discretization and a CFL constraint, not naive unconstrained Euler updates.
5. **Breaking detection:** evaluate steepness and advancing direction together: `|η_x| > threshold` and `η_x u < 0`. Connect neighbouring detected regions; do not spawn repeated crest templates on a timer. This criterion is adapted from Thürey et al.
6. **Airborne water:** integrate position/velocity under gravity and bounded drag; retain launch state. Returning droplets inject a spatially distributed impulse and foam into the shared field. Decorative particles without feedback fail the connected-water requirement.
7. **Correlated variation:** sample seeded noise in advected coordinates `n((x−Ut)/L, t/T)`; combine separated scales with decreasing weights. Domain warping can distort detail coordinates slowly. Never redraw an unrelated random silhouette each frame.

### Research conclusion and experiment gates

The preferred experiment is a coupled field plus state-derived connected breaking sheets and returning particles. Use spectral-style multiscale initialization/forcing and Shan, Shui's stroke/composition principles. This combines collective motion with overhangs while keeping the visible output entirely Braille.

A full particle/FLIP/SPH solver remains an alternative if the hybrid cannot produce convincing contact and overturning at the available character resolution. FFT-only, Gerstner-only, and noise-only approaches cannot satisfy this project's impact feedback requirement without substantial additional systems.

Before accepting the architecture: demonstrate neighbour propagation, rightward transport, cliff reflection, state-derived breaking, returned-water disturbance, stable long runs, and expressive black/purple rendering. Source relevance does not establish visual success.

## Finger integration research — 2026-10-06

Research question: how can the hooked fingers be continuous deforming water rather than geometry attached to water? This follow-up proposes experiments; no animation code changed.

| Primary source                                                                                                                                    | Relevant finding                                                                                                                                | Proposed code adaptation                                                                                                                                                                                                               | Limitation                                                                                                                                                                              |
| ------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Yu and Turk, Anisotropic Surface Reconstruction](https://faculty.cc.gatech.edu/~turk/my_papers/sph_surfaces.pdf), sections 4 and 6               | Neighbour-weighted covariance determines oriented smoothing kernels. The water-crown example retains a continuous base and thin upper features. | Reconstruct crest and fingers from one particle-density field, replacing separately drawn `claw()` polygons. In a side-view implementation, extract a two-dimensional contour with marching squares.                                   | Reconstruction preserves features supplied by motion; it does not generate their dynamics. Kernel extent must be bounded to avoid bridging genuinely detached drops or filling hollows. |
| [Wojtan et al., Physics-Inspired Topology Changes for Thin Fluid Features](https://faculty.cc.gatech.edu/~turk/my_papers/thin_fluid_features.pdf) | Explicit surface tracking retains thin sheets and strands while handling topology consistently with a coarser fluid simulation.                 | Candidate alternative: advect connected surface points through the solved velocity field, refine stretched regions, and support actual splitting/merging.                                                                              | A reduced two-dimensional curve would be an adaptation, not the full paper algorithm. Topology and numerical robustness add significant complexity.                                     |
| [Thürey et al., Real-time Breaking Waves](https://matthias-research.github.io/pages/publications/breakingWaves.pdf), sections 4–6                 | A tracked front emits connected layers over time, using front motion and height-dependent launch velocity, with overlap at the crest.           | If retaining the hybrid, replace the instantaneous profile in `strip()` with continuous emission from a tracked front. Give sheet regions material thickness and evolving connectivity rather than adding fixed forks in the renderer. | The paper's sheets are a visual approximation with incomplete mass transport. This cannot guarantee fully physical finger formation.                                                    |

### Proposed integration experiment

First test particle water with anisotropic reconstruction. Compare it against isotropic reconstruction using exactly the same particle trajectories. This separates missing geometry from missing dynamics. If neither reveals connected fingers, inspect the actual material motion and sampling; do not compensate by increasing kernel reach until unrelated water merges.

For an explicit sheet adaptation, local extension can be measured from neighbouring material distances. A simplified ribbon with conserved area would use `a_new = a_old * length_old / length_new`, where `a` is cross-sectional thickness per unit out-of-plane depth. This is a proposed reduced constraint, not a complete fluid equation. Stretching should narrow a finger; actual separation must update material connectivity and transfer mass/velocity, rather than leave a drawn bridge.

Foam density should mark these deforming surfaces and their fragments. It should not determine an independent rake silhouette. Retire the every-fourth-point rule, identical two-fork topology and globally upward-flipped normals if the replacement succeeds.

Surface tension can matter for fine ligaments and droplet pinch-off, but its strength depends on physical scale. Do not make ocean-scale water rubbery merely to manufacture claws. Hokusai's stylized fingers are an artistic target, not a guarantee of any fluid solver.

### Validation

- Turn foam rendering off: the underlying lip and finger roots must still be connected water.
- Track material through growth, bending, thinning and detachment. Detached material inherits velocity and remains identifiable until it returns.
- Compare kernel settings: broad roots remain joined, intentional black hollows remain open, and detached drops are not spuriously reconnected.
- Review native Braille output and continuous motion, not only the hidden density buffer. Mobile may need fewer resolved fingers, without inventing disconnected ornament.
- Record the reconstruction comparison and material continuity failures before choosing between particle-density contours and explicit surface tracking.
