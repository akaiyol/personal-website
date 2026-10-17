# About Me

Portrait, social links, email copy, photo enlargement and poem interaction.

## Sub-features

- GitHub and LinkedIn destinations.
- Copy email feedback plus clipboard contents.
- Portrait click opens a dialog; Escape closes it.
- Poem word focus and Escape.
- Memory photo Enter/Space enlargement, close button, unique-photo counter, and Alt+Arrow repositioning.

## How to get to it (user POV)

Home about me action, Home shortcut 1, terminal about-me or direct /#about.

## Driving it with Playwright

Preconditions: launch from the canonical checkout as documented in ../SKILL.md.

- Run: the documented command with feature ID `about` instead of `all`.
- Actions and proof: Click the home action, inspect social hrefs, copy email, open/close the portrait, and focus the poem word; capture the resulting About screen.
- Evidence: inspect the feature screenshots, ARIA snapshots, action log and trace in the selected directory.

## Gotchas

Clipboard permissions apply only to the disposable test context. Photos are local assets; a broken image or console exception fails the run.

Coverage limits: mouse/touch photo drag, clipboard failure/fallback and external profile activation are not automated. The harness checks social hrefs and tests normal clipboard success.

The current About markup has no `.term` controls; dormant source handlers do not constitute a user-facing feature.

Social profiles include GitHub and LinkedIn only; Twitter/X is removed. The desktop horizontal and phone stacked character cards retain its original photo, frame animation and details, with no decorative star or added details padding. The responsive workflow checks the removed decoration stays absent and the original padding is preserved.

Phones use a centred vertical photo column. Normal swipes scroll the document; tap and Enter/Space still enlarge photos. Desktop retains horizontal dragging and Alt+Arrow repositioning.
