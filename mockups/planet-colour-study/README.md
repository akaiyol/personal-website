# Planet colour study — 2026-11-13

Provisional colour and texture options requested by Yolanda. Inspired by Matthew Hamilton’s coloured stippled flowers: https://x.com/mhamilton3141/status/2120391302223368465/video/1 . Reviewed directly in browser.

The standalone study embeds a snapshot of the canonical homepage at ce909d3 and replaces its planet renderer only inside the preview. `planet-study.js` derives from `assets/planet/planet.js`: original projection, rings, band paths, stars, 64-second phase, entrance, hover, drag, keyboard and lifecycle remain. New object-space grain and palette mapping affect rendering only. The lower globe stays dark. The live website has not adopted a palette. Flowers are outside this first study.

Open through a local HTTP server at `mockups/planet-colour-study/`. Four PNGs show matched resting poses; the preview below runs the entrance and remains interactive. Palettes are editable in `planet-study.js` and documented in `palettes.json`.

## Review and verification

- Four palette renders reviewed in the existing homepage at 1280×800. Ring divisions, spherical bands, crop, stars and foreground text remain legible.
- First visual pass was too dark; increased the palette range across the visible rings and made the pigment grain denser. Re-rendered all four options.
- Orchid dusk reviewed at 390×844 and 320×844. No horizontal overflow; navigation and text remain visible.
- Chromium checks passed for palette switching, pointer drag, arrow-key rotation and entrance completion. No page errors in the final run. Initial srcdoc preview caused URL errors; replaced with the canonical document snapshot in `frame.html`, then retested.
- Projection, star generation, animation timing, lifecycle and input handler source match the original renderer exactly. Only the drawing treatment changes.
- Full 64-second visual cycle, real hidden-tab pause, Safari and physical touch have not been verified for this mockup. No palette has user aesthetic acceptance yet.
- The production `index.html` and original asset files remain unchanged. This is an editable local review artifact, not a production rollout.
