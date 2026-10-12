# Personal facts

Four reels produce personal facts and support rerolls.

## Sub-features

- Automatic first roll completes.
- Roll button and About keyboard 1 trigger a new roll.
- Four fact results appear and the button re-enables.

## How to get to it (user POV)

Open About; the roll button is below the introduction.

## Driving it with Playwright

Preconditions: launch from the canonical checkout as documented in ../SKILL.md.

- Run: the documented command with feature ID `facts` instead of `all`.
- Actions and proof: Wait for the automatic roll; click Roll, wait for completion, then use keyboard 1 with ordinary page focus and capture the four results.
- Evidence: inspect the feature screenshots, ARIA snapshots, action log and trace in the selected directory.

## Gotchas

Results are random; repeats are valid and a rare jackpot uses four matching facts. Conditional photo/Steam links may not appear in a run; their external destinations are not opened.
