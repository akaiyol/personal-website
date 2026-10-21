# Navigation

Home actions, number shortcuts, identity return and terminal routing.

## Sub-features

- Home → about me button; Home → my work button.
- Browser titles use `Yolanda | <page name>` without a leading slash. Home is `Yolanda | home`, including initial load, route returns and archived Projects fallback.
- From Home, 1 opens About and 2 opens Work unless an editable/control target owns the key.
- Projects is temporarily unavailable; its former placeholder is preserved in source for restoration.
- Terminal text, Tab completion, arrows, Enter, Escape and no-match guidance.

## How to get to it (user POV)

Home at /; terminal is available on each route; identity returns home.

## Driving it with Playwright

Preconditions: launch from the canonical checkout as documented in ../SKILL.md.

- Run: the documented command with feature ID `navigation` instead of `all`.
- Actions and proof: Home button and keyboard navigation, then terminal completion and routing, must show the expected page, title and closed/blurred suggestions.
- Evidence: inspect the feature screenshots, ARIA snapshots, action log and trace in the selected directory.

## Gotchas

Number keys do not override focused controls. External profile destinations leave the website; verify hrefs without navigating away.

Projects is temporarily archived: it must not appear in suggestions, help or the prompt demonstration. Submitting Projects does not open its view; a direct #projects bookmark shows Home. Its source definition remains available for restoration.

Cursor: body uses the standard lavender arrow, links and buttons use the matching hand. Verify cursor assets load and preserve native text-entry and planet grab cursors. Browser screenshots omit the OS cursor; cursor-artwork.png renders the actual SVG assets separately for visual inspection.

## Superseding phone contract — 2026-10-21
Phones (≤700px or coarse short landscape) use direct bottom Home/About/Work and More links. Stats, terminal input, filter bar, year links, caterpillar and detailed work icon lists are omitted. All seven roles retain shortened summaries, solid category labels and outlined tools; phone category labels do not filter. About retains the 2×2 four-reel gacha labelled “press”, original animated photo frames/tags, four photo previews with an All 8 control, and a vertical card in portrait and landscape. Desktop content, terminal, filters, stats and horizontal card remain. Render expanded gallery and every original photo variant. Desktop stats → Home → phone resize must leave no open dialog and working navigation. Earlier phone overlay/vertical-gallery recipes are superseded.
