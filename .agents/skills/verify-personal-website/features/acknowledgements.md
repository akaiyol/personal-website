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

The content has a readable maximum width; tool icons remain centred in their own grid cells, while the whole page is left aligned.

Technology credits: HTML, CSS, JavaScript, Canvas2D, SVG, Git, Playwright, OpenAI Codex and Cloudflare. Cloudflare must remain marked “setup pending” until configured and verified; it is not yet the confirmed live host. Inspect the three-column desktop / two-column phone icon grid.
