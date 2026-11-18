# Purple textured planet

The user selected `mockups/planet-colour-study/` on 2026-11-13, explicitly correcting an initial interpretation that used the later filled Lumen globe. The selected version has fine concentric ring strands, spherical reflected bands, sparse object-space grain and a regular 2×4 Braille lattice. `planet-surface.js` reproduces those geometric layers on the GPU and recolours them in #C5B5EC; it does not use the later Lumen surface, glow or Voyager map. No external code or texture assets are loaded. The original Canvas renderer remains as the no-WebGL fallback. Graphics-context loss pauses rendering and discards momentum; restoration rebuilds the renderer without removing input handlers.

`planet.js` owns view/input/lifecycle and time-integrated flick momentum; `planet-surface.js` owns only drawing. Momentum uses recent pointer samples, a speed/displacement threshold, a capped initial speed, and exact exponential integration with a two-second decay constant. Stale/held releases, cancellation and reduced motion do not fling. Shift plus an arrow key launches momentum for keyboard users. The original 64-second idle remains.

## Verification

The existing project planet recipe calls `scripts/verify-planet-flick.cjs` to exercise flick and keyboard momentum, direction, full decay, reduced motion, route cancellation, real Chromium touch cancellation and phone scroll containment. It records real paint intervals and ordered coast frames; diagnostics do not imply performance on other devices.

## Free rotation — latest user clarification, 2026-11-13

The user rejected the fixed-axis refinement. Dragging now uses a screen-space virtual trackball with quaternion orientation: horizontal, vertical, diagonal and curved gestures may freely change pitch, yaw and roll. The sphere/hyperbolic mapping stays continuous beyond the globe edge. `trackball.js` owns this geometry and angular-velocity calculation. Momentum continues the recent drag rotation at release, with exponential decay and no rest-pose reset. Edge-on rings are a legitimate user-selected orientation, not a failure by themselves. The original entrance stops at its current pose when interrupted. Stars follow explicit dragging and keyboard rotation, but retain their separate slow phase during planet inertia. This correction does not change the surface renderer or its quietened texture.

Acceptance checks: pointer-follow geometry; normalized orientation after repeated rotations; nearby diagonal gestures have nearby axes; horizontal and vertical gestures produce different axes; release coast continues the sampled axis; held release retains the selected orientation; full decay, catch, cancellation, reduced motion and route handling remain functional. `node scripts/test-planet-trackball.cjs` checks the pure geometry; the planet recipe exercises native mouse/touch input and records full coast motion. Review rendered desktop and narrow layouts separately from these assertions.

Safari, physical touch and actual background-tab visibility remain unverified. Earlier fixed-axis verification is superseded; see the latest evidence for this controller.

Current correction checks passed in Chromium: planet recipe, phone Home touch/scroll recipe, pure trackball geometry, no-WebGL input and deliberate WebGL loss/restoration. Full recorded coast reached zero and continued idle. Paint observations in the recorded drive: median 16.5ms, p95 19.2ms. Evidence: `/private/tmp/planet-trackball-verify` and `/private/tmp/planet-trackball-phone` (working diff from 28ab190). Desktop, 390px and 320px rendered views were reviewed; the existing texture-density concern remains a separate visual refinement, not resolved by this interaction correction.

## Rendering performance — 17 November 2026

The no-WebGL renderer now computes the linear view basis once per frame and targets 30 paints per second instead of the previous >50ms paint gate. The existing GPU path still paints each animation frame; texture, orientation, input and lifecycle are unchanged. Desktop Chromium measured a median fallback paint interval near 34ms versus the production Canvas script’s 66ms. GPU startup compilation can still cause a short initial stall; sustained movement and startup are separate measurements. Browser/emulator results do not establish physical-device performance.

## Sustained rendering budget — 17 November 2026

On a high-density screen, the accelerated renderer observes 30-frame windows. If at least 20 intervals exceed 24ms, it lowers only the backing-store ratio from 2 to 1.5 and, if necessary, 1. The CSS-sized scene texture, geometry, dot-cell spacing, foreground text and pointer mapping remain fixed. A single startup spike does not meet this threshold. Reduced motion does not adapt; the Canvas fallback retains its 30fps target. Native ratio changes reset the selected ratio. A reduced ratio stays selected for that document to avoid visible quality oscillation; this trades some edge antialiasing for responsiveness under sustained overload.

Canvas backing stores are reallocated only when dimensions actually change. `scripts/verify-render-budget.cjs BASE_URL OUT` uses explicit scheduler fixtures to verify both cadence policies, stable foreground layout, reduced motion and keyboard rotation. It is not a physical-device performance benchmark.
