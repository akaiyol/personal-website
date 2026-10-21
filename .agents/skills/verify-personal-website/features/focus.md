# Activation focus release

Run the verification helper with feature ID `focus`. The shared focus-release handler applies to buttons, links and role buttons, including dynamically created controls.

Verify mouse click, Enter and Space on Home actions, terminal Go, copy email, Roll, portrait and all gallery photos, dialog close, every work filter and per-role tag, stats visibility and comparison. Assert the activated control no longer owns focus, while pressed/expanded state remains correct. Opening a dialog must retain its new focus; closing it releases restored photo-trigger focus. Tab focus remains available until activation. Check page shortcuts after activation and the narrow stats toggle. External links are not activated; hidden or decorative controls are not actionable buttons. Random fact photo tags are tested when present in a roll.

Evidence: focus-coverage.json lists controls and input modes exercised; screenshots show post-activation states. DOM focus assertions, rather than screenshot appearance alone, establish deselection. The test uses reduced motion to avoid waits for unrelated animations; motion is not under test.

## Superseding phone contract — 2026-10-21
Phones (≤700px or coarse short landscape) use direct bottom Home/About/Work and More links. Stats, terminal input, filter bar, year links, caterpillar and detailed work icon lists are omitted. All seven roles retain shortened summaries, solid category labels and outlined tools; phone category labels do not filter. About retains the 2×2 four-reel gacha labelled “press”, original animated photo frames/tags, four photo previews with an All 8 control, and a vertical card in portrait and landscape. Desktop content, terminal, filters, stats and horizontal card remain. Render expanded gallery and every original photo variant. Desktop stats → Home → phone resize must leave no open dialog and working navigation. Earlier phone overlay/vertical-gallery recipes are superseded.
