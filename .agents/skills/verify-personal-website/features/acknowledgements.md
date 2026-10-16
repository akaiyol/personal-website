# Acknowledgements

Credits page retains left alignment and works through the shared terminal.

## Sub-features

- Terminal acknowledgements opens credits and updates the browser title.
- Credits begin at the left content padding.
- Narrow layout remains readable without horizontal overflow.

## How to get to it (user POV)

Type acknowledgements in the shared terminal and press Enter, or visit /#acknowledgements.

## Driving it with Playwright

Preconditions: launch from the canonical checkout as documented in ../SKILL.md.

- Run: the documented command with feature ID `acknowledgements` instead of `all`.
- Actions and proof: Navigate with the terminal, compare content start with main padding, and capture desktop plus 390px layouts.
- Evidence: inspect the feature screenshots, ARIA snapshots, action log and trace in the selected directory.

## Gotchas

The technology grid fills the available page width, with four columns on desktop and two on phones. Citations retain a readable maximum width and left alignment.

Public technology credits are JavaScript, Canvas 2D, OpenAI Codex and Cloudflare, without setup or deployment notes. Routine markup, graphics formats, version control and testing tools are intentionally omitted from this curated list. Cloudflare configuration still requires separate verification before claiming hosting or analytics is live.
