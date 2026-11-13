# Lumen planet study — 2026-11-13

Supersedes the first colour study as the current exploration. Yolanda rejected those mocks as too similar to the original and requested semi-realistic volume, extensive colour variation and the reference’s look and feel.

The current material uses a Voyager/JPL cloud map with expressive grading, directional illumination, a terminator, mineral ring material, planet-on-ring and ring-on-planet shadows. Earlier procedural versions remain documented in the evaluation record. This smooth colour source is processed by Lumen’s actual RGB dither, LED stamp and bloom renderer. It is not a photographic/scientific reconstruction of Saturn.

Preserved: original radius/crop, projection, entrance, hover, 64-second axial timing, drag, arrow keys, stars and lifecycle handlers. Render-only prototype; production assets remain unchanged. Three alternative materials explore the new treatment.

## Third-party attribution

Lumen, Matthew Hamilton, MIT: https://github.com/matthewhamilton3141/lumen . Unmodified vendored source modules and license are under `lumen/`. Retrieved 2026-11-13. The source renderer uses `makeRenderer`, original-colour mode (six levels per RGB channel), Bayer 4×4 dithering, LED stamps and glow. No media, codecs or npm dependencies are installed.

Open through the local server at `mockups/planet-lumen-study/`. `frame.html` is a snapshot of the canonical homepage at d9b59b5, with only the planet renderer replaced for this study. Editable material and lighting code is in `planet-lumen.js`.

## Rendered review and checks

- Reference: the X flower video and Lumen LED treatment. The defining features are shaded recognizable subjects, many source colours, lit dot cores, black interstices, and bloom. Previous line recolours were insufficient.
- Initial full-volume render was overexposed. Lowered diffuse intensity and bloom; reduced pale mixing in the rings. Final renders retain visible hue variation, lower-hemisphere shadow and distinct ring divisions.
- Reviewed all three desktop materials at 1280×800. Reviewed the primary material at 390×844 and 320×844; text and controls remain readable, artwork stays contained, and there is no horizontal overflow.
- Reviewed ordered entrance frames through settling into idle. The ring crosses edge-on during the original entrance and reaches its original rest pose; content remains stationary.
- Chromium checks passed: material selection, pointer drag, arrow keys, entrance completion and reduced-motion static phase. No page errors. Source comparison confirms original projection, stars, animation timing, lifecycle and input handlers are retained exactly.
- Original star layer remains behind the new material. Lumen source is vendored locally with its MIT license; runtime makes no third-party requests.
- Not verified: full 64-second visual rotation cycle, real hidden-tab pause, Safari and physical touch. User aesthetic acceptance remains open. Flowers are outside this study.

## Evaluation loop — 2026-11-13

Read `evaluation/CRITERIA.md` and `evaluation/ITERATIONS.md`. Open `evaluation/index.html` for the matched baseline comparison and current status. Run `node mockups/planet-lumen-study/evaluate.cjs EVIDENCE_DIRECTORY` from the website root; `--quick` omits the full rotation. Use a fresh evidence directory. This is an on-demand artifact loop; visual acceptance remains a reviewed judgment. Source-map attribution and limitations are in `SOURCE.md`.

The latest full run passed 21 automated checks and captured the entrance/full rotation. Natural-detail fidelity and dot dominance remain partial; do not use this checkpoint to claim the design is finished.
