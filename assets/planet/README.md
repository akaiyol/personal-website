# Purple textured planet

The user selected `mockups/planet-colour-study/` on 2026-11-13, explicitly correcting an initial interpretation that used the later filled Lumen globe. The selected version has fine concentric ring strands, spherical reflected bands, sparse object-space grain and a regular 2×4 Braille lattice. `planet-surface.js` reproduces those geometric layers on the GPU and recolours them in #C5B5EC; it does not use the later Lumen surface, glow or Voyager map. No external code or texture assets are loaded. The original Canvas renderer remains as the no-WebGL fallback. Graphics-context loss pauses rendering and discards momentum; restoration rebuilds the renderer without removing input handlers.

`planet.js` owns view/input/lifecycle and time-integrated flick momentum; `planet-surface.js` owns only drawing. Momentum uses recent pointer samples, a speed/displacement threshold, a capped initial speed, and exact exponential integration with a two-second decay constant. Stale/held releases, cancellation and reduced motion do not fling. Shift plus an arrow key launches momentum for keyboard users. The original 64-second idle remains.

## Verification

The existing project planet recipe calls `scripts/verify-planet-flick.cjs` to exercise flick and keyboard momentum, direction, full decay, reduced motion, route cancellation, real Chromium touch cancellation and phone scroll containment. It records real paint intervals and ordered coast frames; diagnostics do not imply performance on other devices.

## Confirmed checks

Chromium planet and phone-Home recipes passed for the selected line/stipple version. Flick coverage includes both directions, vertical flick, full decay and idle continuation, slow/held release rejection, keyboard launch/catch, route cancellation, reduced motion, native touch replay/cancellation and phone scroll containment. Timestamped native input defines gesture velocity independently of tracing/video overhead. A separate direct-render measurement observed a 16.7ms median and 17.6ms p95 paint interval; the final recorded drive observed 16.7ms median and 18ms p95 over 1,151 frames. These are local Chromium observations, not a guarantee on every device.

No-WebGL fallback and deliberate WebGL context loss/restoration were checked separately. Actual background-tab visibility, physical touch and Safari performance remain unverified. The user-selected study is the visual reference; the later multicolour evaluation is historical.
