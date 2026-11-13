# Planet design target and evaluation contract

Status: working criteria derived from Yolanda’s requests on 2026-11-13; final aesthetic acceptance belongs to Yolanda. This evaluates the website artifact, not Daphnie’s skills or personality.

## Goal

A convincing, richly coloured world seen through a luminous dot texture. Match the flower reference’s combination of natural subject detail, broad source colour, visible dark gaps, bright dot cores and restrained bloom. Preserve the website’s ringed identity, terminal composition and existing movement.

Sources: https://x.com/mhamilton3141/status/2120391302223368465/video/1 ; https://github.com/matthewhamilton3141/lumen ; project `design.md`, latest planet exploration correction. The flower is a treatment/mood reference, not planet geometry. “Semi-realistic” permits expressive colour; it requires credible form, lighting and material variation. The user’s new colour direction supersedes the old two-colour rule for these studies only.

## Success criteria

| ID | Criterion | Evidence required | Failure condition |
|---|---|---|---|
| V1 | Convincing volume | Resting and rotated globe at page scale; smooth light-to-shadow progression, contour, ring occlusion and shadows agree | Flat pattern, clipped white highlights, detached rim, inconsistent shadow |
| V2 | Natural surface variation | Detail and page-scale views show broad regions, fine cloud structure and nonrepeating local features | Repeated rainbow waves, flat colour fill or texture visible only when enlarged |
| V3 | Rich, coherent colour | Multiple hue families and within-region tonal changes remain visible | Merely recoloured outlines, uniform tint, or equally loud spectral stripes everywhere |
| V4 | Reference-like luminous texture | Dot cores, black gaps and local glow remain distinguishable at actual target sizes | Screen-like grid overwhelms subject; bloom merges colours into white or obscures structure |
| V5 | Distinct, believable rings | Fine concentric material, clear divisions, depth ordering and a subordinate colour role | Rings resemble a second rainbow-painted surface, alias into broken slabs, or cross globe incorrectly |
| V6 | Site composition | Desktop 1280×800 and 1470×864; phones 390×844 and 320×844 | Unreadable heading/copy/controls, new layout shift, page overflow, altered interface palette/copy |
| B1 | Existing interaction | Real pointer drags both ways, all arrow keys, hover hint, navigation and return | Wrong direction, stuck capture, lost focus, intro replay or foreground action blocked |
| B2 | Motion lifecycle | Full entrance; real-time 64-second axial cycle plus continuation; reduced motion; hidden route and real background tab | Jump/seam, geometry wobble, uncontained glow, unexpected animation or background work |
| B3 | Rendering health | No page errors; record active frame intervals and long tasks in the same environment | New errors or measured interaction/rendering regression; timings are diagnostics, not an aesthetic score |

Visual rows use `pass`, `partial`, `fail`, `unverified`, with a concrete observation and evidence path. No weighted taste score, colour-count proxy or automatic claim that “uses Lumen” means “matches reference”. A render is not reviewed until a reviewer actually inspects it. Automated checks cannot pass V1–V5.

## Repeatable evaluation loop

1. Preserve a named baseline with its Git revision and renderer hash. Keep the baseline visible beside the candidate; do not overwrite it with an intermediate.
2. Run `node mockups/planet-lumen-study/evaluate.cjs EVIDENCE_DIRECTORY`. The harness owns a local-only server/browser, records the exact source identity, renders all three materials at the target widths, checks behaviour and captures the entrance and full rotation. Use a fresh evidence directory each time.
3. Inspect matched views at actual page scale, then detail views and ordered motion frames. Compare with the reference, including features present in the reference but absent in the result.
4. Record each criterion and the highest-impact visible defect in `evaluation/ITERATIONS.md`, with evidence. Distinguish code checks, visual judgment, user acceptance and untested devices.
5. Change one coherent cause. Re-run affected checks and re-render every shared variant. Keep the candidate only if the named defect improves without a material regression elsewhere.
6. Stop when all required criteria have reviewed evidence and Yolanda accepts the result. If the same defect survives two attempts, reassess the representation/source material before adding detail. Until then label the result a candidate and keep outstanding items explicit.

This is an on-demand local loop. It does not schedule background work, publish the site, modify Daphnie’s reusable skills or authorize flowers.

## First hypothesis

The biggest mismatch is in the source material, not a missing Lumen setting. Replace cyclic rainbow bands with a regional colour field, multiscale cloud detail and localized vortices; give the rings a restrained mineral material. Preserve renderer settings and all animation/input code for the first comparison so the cause is reviewable.
