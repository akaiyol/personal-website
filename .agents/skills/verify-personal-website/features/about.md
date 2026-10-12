# About Me

Portrait, social links, email copy, photo enlargement and poem interaction.

## Sub-features

- GitHub, LinkedIn and Twitter/X destinations.
- Copy email feedback plus clipboard contents.
- Portrait click opens a dialog; Escape closes it.
- Poem word focus and Escape.

## How to get to it (user POV)

Home about me action, Home shortcut 1, terminal about-me or direct /#about.

## Driving it with Playwright

Preconditions: launch from the canonical checkout as documented in ../SKILL.md.

- Run: the documented command with feature ID `about` instead of `all`.
- Actions and proof: Click the home action, inspect social hrefs, copy email, open/close the portrait, and focus the poem word; capture the resulting About screen.
- Evidence: inspect the feature screenshots, ARIA snapshots, action log and trace in the selected directory.

## Gotchas

Clipboard permissions apply only to the disposable test context. Photos are local assets; a broken image or console exception fails the run.
