# Personal facts

Four reels produce personal facts and support rerolls.

## Sub-features

- Automatic first roll completes.
- Roll button and About keyboard 1 trigger a new roll.
- Four normal fact results, or one labubu jackpot label with four star reels, appear and the button re-enables.

## How to get to it (user POV)

Open About; the roll button is below the introduction.

## Driving it with Playwright

Preconditions: launch from the canonical checkout as documented in ../SKILL.md.

- Run: the documented command with feature ID `facts` instead of `all`.
- Actions and proof: Wait for the automatic roll; click Roll, wait for completion, then use keyboard 1 with ordinary page focus and observe busy-to-complete transitions and capture the normal or jackpot results.
- Evidence: inspect the feature screenshots, ARIA snapshots, action log and trace in the selected directory.

## Gotchas

Results are random; repeats across rolls are valid. Normal rolls draw four distinct facts; a rare jackpot displays four star reels and one labubu label. Conditional photo/Steam links may not appear in a run; their external destinations are not opened.

Phones show the four reels in a 2×2 grid, each result beneath its symbol and Roll below the complete grid. The label rows reserve space while rolling. Desktop keeps four reels across.

For the phone-specific regression pass, run `verify-phone-about.py --base URL --out FRESH_DIRECTORY` through the upstream `with_server.py` and `serve-public.py` workflow in screens.md. It exercises six viewport configurations, all eight photo dialogs, real touch swipes, keyboard rerolls, settled and rolling geometry, and reduced motion. Disposable browser contexts supply controlled entropy to reach long labels, conditional photo tags and the rare jackpot through the actual Roll control; production RNG is unchanged. Inspect its screenshots and ordered animation frames before acceptance.
