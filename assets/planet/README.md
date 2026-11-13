# Purple textured planet

The user selected `mockups/planet-colour-study/` on 2026-11-13, explicitly correcting an initial interpretation that used the later filled Lumen globe. The selected version has fine concentric ring strands, spherical reflected bands, sparse object-space grain and a regular 2×4 Braille lattice. `planet-surface.js` reproduces those geometric layers on the GPU and recolours them in #C5B5EC; it does not use the later Lumen surface, glow or Voyager map. No external code or texture assets are loaded. The original Canvas renderer remains as the no-WebGL fallback. Graphics-context loss pauses rendering and discards momentum; restoration rebuilds the renderer without removing input handlers.

`planet.js` owns view/input/lifecycle and time-integrated flick momentum; `planet-surface.js` owns only drawing. Momentum uses recent pointer samples, a speed/displacement threshold, a capped initial speed, and exact exponential integration with a two-second decay constant. Stale/held releases, cancellation and reduced motion do not fling. Shift plus an arrow key launches momentum for keyboard users. The original 64-second idle remains.

## Verification

The existing project planet recipe calls `scripts/verify-planet-flick.cjs` to exercise flick and keyboard momentum, direction, full decay, reduced motion, route cancellation, real Chromium touch cancellation and phone scroll containment. It records real paint intervals and ordered coast frames; diagnostics do not imply performance on other devices.

## Confirmed checks

Chromium planet and phone-Home recipes passed for the selected line/stipple version. Flick coverage includes both directions, vertical flick, full decay and idle continuation, slow/held release rejection, keyboard launch/catch, route cancellation, reduced motion, native touch replay/cancellation and phone scroll containment. Timestamped native input defines gesture velocity independently of tracing/video overhead. A separate direct-render measurement observed a 16.7ms median and 17.6ms p95 paint interval; the final recorded drive observed 16.7ms median and 18ms p95 over 1,151 frames. These are local Chromium observations, not a guarantee on every device.

No-WebGL fallback and deliberate WebGL context loss/restoration were checked separately. Actual background-tab visibility, physical touch and Safari performance remain unverified. The user-selected study is the visual reference; the later multicolour evaluation is historical.

## Stable-axis refinement

A reproduced regression showed that a diagonal flick changed base pitch to −0.02rad (edge-on), and repeated sideways flicks accumulated roll to 1.505rad (nearly vertical). Compared tightly bounded tilt with axial-only input using identical native gestures. Bounded tilt avoided the extremes but continued to move the ring angle; fixed-axis input kept pitch 0.40 and roll 0.32 throughout and was selected.

Pointer gestures choose a horizontal or vertical axial direction once, avoiding diagonal sign jitter. Arrow keys use the same fixed axis. Small hover motion and the original entrance remain; an interrupted entrance settles smoothly before pending momentum launches. Stars retain a separate idle phase rather than accelerating with the planet. Sphere grain is substantially sparser/fainter, and reflected bands are quieter than the main rings.

The updated planet and phone-Home recipes passed. New checks cover camera invariance across repeated/diagonal gestures, independent slow star movement and early momentum waiting for the entrance to settle. The recorded drive observed median 16.6ms and p95 18.3ms paint intervals over 1,261 frames. This supersedes the prior refinement’s appearance/motion notes; Safari, physical touch and real background-tab visibility remain unverified.
