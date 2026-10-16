# About Me

Portrait, social links, email copy, photo enlargement and poem interaction.

## Sub-features

- GitHub, LinkedIn and Twitter/X destinations.
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

Social profiles now include GitHub and LinkedIn only; Twitter/X is removed. The character card has a decorative soft striped star inside its upper-right rim, floating beside the name without added padding or grid changes. The responsive workflow checks visible lavender colour, inert input behavior and no overlap with actual text glyphs and zero added details padding at all twelve sizes. Inspect the actual desktop and narrow card screenshots; inherited frame ink can otherwise make decorations transparent.

The striped star uses the photo frame’s fine line weight and three-impression .72-second line boil. The About workflow observes all three impressions and verifies card/text geometry stays fixed, then checks pausing when closed. Reduced motion is static.
