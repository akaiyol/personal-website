# Navigation

Home actions, number shortcuts, identity return and terminal routing.

## Sub-features

- Home → about me button; Home → my work button.
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
