# Wave architecture and model decisions

**Status: coupled-field prototype retained as baseline; replacement selection deferred until the static and deformation studies pass.** Research evidence is in `wave-research.md`; baseline source and rendered diagnosis are in `wave-diagnosis.md`.

## Model selection requirements

Choose a coherent combination that produces rightward transport, neighbouring influence, emergent asymmetric formations, breaking, and collision-driven secondary motion. Prioritize believable collective movement over physically perfect simulation. Compare alternatives and record why the chosen model meets those requirements.

## System responsibilities

| System                | Required responsibility                                  | State or variation to evaluate                                  |
| --------------------- | -------------------------------------------------------- | --------------------------------------------------------------- |
| Ocean state           | One shared evolving body of water                        | Stateful; identify the actual conserved/approximated quantities |
| Large-scale field     | Transport, interference, dominant formations             | Deterministic update with seeded forcing; must support coupling |
| Turbulence/noise      | Correlated local deviations at several scales            | Noise-driven, spatially and temporally coherent                 |
| Crest detection       | Identify emerging steep/breaking regions                 | Derived from the water state rather than a spawn timer          |
| Cliff interaction     | Compression, upward redirection, reflection              | Stateful boundary response                                      |
| Collision energy      | Link force to incoming state                             | Derived measure with explicit assumptions                       |
| Foam                  | Generate, transport, fragment, and disperse surface foam | Stateful; thresholds and correlated variation                   |
| Spray particles       | Launch clumps/droplets, integrate flight, and reconnect  | Stateful, seeded stochastic launch variation                    |
| Secondary propagation | Backwash and returned disturbances affect incoming water | Coupled to the ocean state                                      |
| Geometry/rendering    | Foam patches, supporting geometry, and open hollows | Derived artwork; avoid persistent template emblems              |
| Braille conversion    | Stable sampling and character-cell packing               | Deterministic renderer; bounded resolution                      |
| Colour assignment     | Only approved black/purple output                        | Fixed `design.md` palette; hierarchy through density            |
| Animation timing      | Stable integration, independent render pacing            | Elapsed time, reduced motion, hidden-page pause                 |

## Required relationships

- Forcing changes ocean state; ocean state changes neighbouring state through the chosen coupling model.
- Crests and breaking are detected from that state.
- Breaking produces foam and spray that inherit local motion.
- Cliff contact produces an energy-dependent response and a returning disturbance.
- Returning water, backwash, and incoming flow interact in the same system.
- Geometry and Braille rendering reveal those relationships rather than substituting decorative events for them.

## Variation strategy

Specify the distributions, bounds, correlations, and timescales for wavelength, amplitude, width, spacing, phase, speed, local direction, curvature, turbulence, foam, spray, and impact duration. Prefer seeded development runs. Avoid independent per-frame randomness and visibly recurring short loops.

## Tuning controls to define

| Parameter                        | Meaning                                                    |
| -------------------------------- | ---------------------------------------------------------- |
| Ocean roughness                  | Distribution of surface disturbance across scales          |
| Dominant-wave frequency and size | Rate and scale of emergent major formations                |
| Turbulence                       | Local circulation and deviation from directional transport |
| Flow speed                       | Global rightward transport                                 |
| Crest sharpness                  | Asymmetry, steepening, and breaking tendency               |
| Foam threshold                   | State-based onset of surface foam                          |
| Spray quantity and velocity      | Fragment count/scale and launch momentum                   |
| Cliff impact strength            | Boundary response relative to incoming energy              |
| Backwash                         | Returning flow and its influence on incoming water         |
| Randomness                       | Degree of bounded, correlated variation                    |
| Temporal coherence               | Persistence and rate of change of generated structure      |

Define units or normalized ranges, relationships, stability limits, and visible effects before selecting values. Independent artistic tuning must not destroy required mathematical coupling. Avoid unexplained collections of constants.

## Decision record to complete

For each selected mechanism record: source evidence; alternatives; governing equations; state ownership; causal relationships; artistic tradeoffs; stability/performance constraints; and the experiment that will establish whether it works. Label candidates separately from final choices.

## ADR 001 — historical baseline: coupled surface with state-derived overturning

The following records the current prototype, not the approved replacement appearance. Water contours and repeated claw geometry are superseded by the foam-only reference.

Choose an advected, damped neighbour-coupled wave field, with connected breaking strips and ballistic spray. This is a stylized side-view model, not a physically conservative Navier–Stokes solver. It keeps one surface state and lets returned water disturb it. FFT/Gerstner alone offer no local response; a full particle fluid is costly at text resolution.

State: displacement η, vertical rate v, persistent foam f at 256 nodes; finite breaking strips; airborne drops; boundary pressure. World dimensions 1000 by 320 drawing units. Update `D_t η=v`, `D_t v=c²η_xx−γv+F`; fixed step 1/120 second, semi-Lagrangian transport, bounded amplitudes. Target `c Δt/Δx < 0.5`. Right transport tapers near the cliff; reflecting ghost samples and incoming pressure redirect energy into upward strips and a returning field impulse.

Seeded multiscale swell initializes the whole domain. Slowly varying correlated forcing sustains it. Front slope and local elevation determine breaking; strips inherit field motion, experience gravity, and return impulses and foam. No independent timed wave objects. Numerical clipping is an artistic safety bound, not conservation. Rendering samples the shared contour and attached strips, with sparse interior marks and dense energized edges.

Experiment gates: neighbour impulse propagation, deterministic replay, finite bounded long runs, multi-scale asymmetry, visible cliff compression and upward spray, returned disturbances, and desktop/mobile motion review. Failure of these gates requires revising the underlying system.

### Implemented forcing and bounds

The shared field uses five directionally travelling scales: wavelength/amplitude/speed `(370,40,103)`, `(223,25,119)`, `(139,18,131)`, `(71,9,145)`, `(43,4,150)` in drawing units and seconds. Noise modulates envelopes slowly. Transport is 52 units/s, tapering to zero over the final 120 units. Propagation speed is 105 units/s with bounded elevation-dependent stiffness. Grid spacing is about 3.92; at 1/120 second the maximum propagation CFL ratio is about 0.26.

Let `S(x,t)` be the correlated swell target. Wind forcing is `F=D_t²S−c²S_xx+γD_tS+1.5(S−η)`, evaluated with centred finite differences. This sustains small-scale swell that numerical advection otherwise erases. It is an artistic forcing model, not a claim of simulated wind stresses. The actual field Laplacian remains coupled: deviations from S, including collision and return impulses, propagate through neighbours. Displacement is bounded to `[-85,120]`; rates to `[-220,220]`.

Breaking uses descending front slope below −0.62 and elevation above 28; neighbouring active roots within 105 units suppress duplicate strips. Strip launch speed depends on elevation and steepness; ballistic initialization uses gravity, followed by neighbour tension, drag and gravity integration. Impacts require pressure proxy above 45 and a rising near-wall rate above 5. The proxy combines elevation and positive rise, not measured joules. Pressure releases after contact. High near-wall launch and lower outer launch create a curved crown and backwash.

Spray and sheets are capped at 700 and 22. Deposits occur once per returning element; their rate impulses are scaled to 0.15 to avoid numerical draining. Foam advection and decay use the shared transport. Maximum flight/sheet age bounds memory. Root attachment and finite lifetimes are stylized reductions, not volume conservation.

### Foam geometry refinement — 2026-10-06

Each connected strip stores a birth seed and persistent material indices. The renderer derives local tangents and outward normals from surviving water points. Near the strip's highest region it draws a broad cap, with spaced major tapered hooks and smaller curved forks. Birth-seeded variation changes reach and curvature slowly, while roots remain attached to their water elements. Headroom bounds prevent accidental crown clipping. This is a procedural rendering adaptation of the reference, not an additional fluid solver.

Ten selective interior contours replace seventeen equally prominent bands. Numerical coverage levels in the hidden mask control which Braille dots exist; they do not introduce displayed gray, opacity, or additional purple shades. Spray retains existing trajectories and return feedback; fragment sizes now follow a skewed distribution, favouring small drops with occasional larger clumps.

## Candidate: integrated crest and finger material — 2026-10-06

Status: research proposal; not approved or implemented. Sources, limitations and validation are recorded in [wave-research.md](wave-research.md#finger-integration-research--2026-10-06).

Compare anisotropic particle-density reconstruction against isotropic reconstruction using identical motion. The crest and fingers must share a reconstructed surface; foam marks that material rather than defining separate rake polygons. Explicit surface tracking and continuously emitted connected sheets are alternatives, not additional systems automatically stacked onto the model.

If adopted, replace repeated `claw()` topology and every-fourth-point placement. Validate connected roots, deformation, narrowing, detachment and inherited velocity; reject false bridges between detached drops and closed black hollows. Solver selection remains open.
