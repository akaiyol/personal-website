# Procedural flower field

`field.js` owns growth, independent sway, input and visibility. `bloom-renderer.js` retains the authored ribbon surfaces, numeric cups and seeded dot texture. `bloom-worker.js` rasterizes those same blooms with OffscreenCanvas and transfers completed ImageBitmaps to the field.

Only one bloom job runs at a time. The next job uses the current desired growth stage, rather than queuing every pointer/animation event. Resize generations discard obsolete results. Replaced bitmaps are closed. Hidden/offscreen fields dispatch no further jobs; a job already running may finish. Unsupported or failed workers use the same renderer on the main thread. Each leaf texture is rasterized once per plant/layout and transformed during growth and sway instead of redrawing its dots every frame. The fallback preserves functionality but cannot guarantee the worker path's growth performance.

No external textures or libraries are fetched. `.assetsignore` explicitly includes all three renderer scripts. `index.html` loads the shared renderer before the field.

Verification: run the project `flowerIntro` and `work` recipes for input/lifecycle, then `scripts/verify-flower-rendering.cjs BASE_URL EVIDENCE_DIRECTORY` against an owned canonical public preview. The parity check compares actual canvas pixels for full, partial and empty growth at 1280/390/320px, with the worker enabled, unavailable and deliberately failing to load. It checks resize, rewind clearing and reduced-motion completion; it does not establish physical Safari support or motion quality. Use the rendered critique for those visual/motion assessments.
