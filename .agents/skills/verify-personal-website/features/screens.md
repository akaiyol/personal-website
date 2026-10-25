# Required rendered screen inventory

Render Home, About, Work and Acknowledgements, plus legacy Connect, at 1470×864, 1280×900, 820×1180, 390×844 and 320×740. Capture top viewport, full page and the scrolled bottom of every long page. Capture terminal suggestions, About gacha and gallery, the desktop horizontal / phone stacked character card and gallery-photo dialog, Work stats shown and the full flower field at every size. Capture every work filter on desktop; on phones verify the filter bar and stats are omitted and all seven roles remain. Verify archived #projects resolves to Home. External GitHub/LinkedIn pages, historical studies and archived Projects are not application screens.

Use render-screens.py with the installed upstream webapp-testing/scripts/with_server.py helper and serve-public.py. The server only exposes public website assets on localhost and /__doctor. The renderer confirms canonical root and revision, waits for networkidle and fonts, checks visible images, rendered flower-canvas pixels and overflow, captures screenshots plus a trace, and closes its browser context. The upstream helper owns server teardown. Do not attach to an existing user server or browser.

## Run

From the canonical main checkout, using a Python environment with Playwright installed:

```sh
python -m venv /private/tmp/website-testing-venv
/private/tmp/website-testing-venv/bin/pip install -r .agents/skills/verify-personal-website/requirements.txt
/private/tmp/website-testing-venv/bin/python -m playwright install chromium
/private/tmp/website-testing-venv/bin/python .agents/skills/webapp-testing/scripts/with_server.py --help
/private/tmp/website-testing-venv/bin/python .agents/skills/webapp-testing/scripts/with_server.py --server "/private/tmp/website-testing-venv/bin/python .agents/skills/verify-personal-website/serve-public.py --port 58139" --port 58139 -- /private/tmp/website-testing-venv/bin/python .agents/skills/verify-personal-website/render-screens.py --base http://127.0.0.1:58139 --out /private/tmp/website-screen-review-NEW
```

Confirm the port is free before starting; choose another if occupied. An existing compatible Chromium can be supplied with PLAYWRIGHT_CHROMIUM_EXECUTABLE. Python dependencies remain outside the repository. Also run the existing verification helper with `all` for behavior, focus, responsive composition and animation sequences; the screen renderer uses reduced motion for stable composition only.

## Review before completion

Inspect every captured screen at its intended size and review the full-page composition, visible content, fixed footer, clipping, wrapping, spacing and control legibility. Full-page screenshots can show the viewport-fixed footer over a long page: inspect scrolled viewport captures to distinguish accessible content from permanent clipping. Review desktop and phone detail states at readable scale, not only tiny contact sheets. For any defect, record the screenshot, location, symptom and impact; fix only authorized product issues and re-render affected states. Use the existing critique skill for animation quality and design fidelity.

screens.json starts with review=pending for every screenshot. A reviewer must explicitly record which images were inspected, findings and limitations; do not automatically mark screenshots accepted because tests passed. Keep review evidence outside the repository. Failure or unreviewed screens must be reported, not described as verified. No framework, viewport or screenshot matrix proves support for every possible device.

## Phone-specific review

Use `render-screens.py --phone` for touch-enabled mobile emulation at320×740,375×812,390×844,430×932 and844×390. The renderer activates buttons and photo dialogs with touchscreen taps, captures the direct phone navigation and expanded photo collection, verifies omitted phone stats/terminal, shared shell/footer bounds, visible landscape Home actions and reachable photo details. Visible lazy images are awaited only when their clipped viewport region is relevant; long pages are scrolled before full-page capture. Inspect all portrait and landscape captures. Emulator checks do not replace physical iPhone/Android testing or the OS virtual keyboard.

Landscape phone full-page coverage uses overlapping scrolled viewport captures, preserving the actual short-screen media query. Native full-page capture may temporarily expand the layout height and show a different layout; do not use it as landscape composition evidence. The manifest records each scroll offset, document height and coverage group.

## Resolved phone regressions — 2026-10-21

Phone stats are omitted, so desktop stats → Home → phone resize must never open a hidden-route modal. The vertical character card clamps content to the dialog and is checked for internal overflow in portrait and landscape. The earlier failures are now regression cases.

## Superseding phone contract — 2026-10-21
Phones (≤700px or coarse short landscape) use direct bottom Home/About/Work and More links. Stats, terminal input, filter bar, year links, caterpillar and detailed work icon lists are omitted. All seven roles retain shortened summaries, solid category labels and outlined tools; phone category labels do not filter. About retains the 2×2 four-reel gacha labelled “press”, original animated photo frames/tags, four photo previews with an All 8 control, and a vertical card in portrait and landscape. Desktop content, terminal, filters, stats and horizontal card remain. Render expanded gallery and every original photo variant. Desktop stats → Home → phone resize must leave no open dialog and working navigation. Earlier phone overlay/vertical-gallery recipes are superseded.

Phone Home (2026-10-25): the root receives phone-home only while the Home hero is visible in phone composition. Fix the body to 100dvh, hide root/body overflow and overscroll, and give the canvas touch-action:none. phoneHome verifies CDP up/down touch changes planet rotation while scrollY stays zero, wheel/programmatic scroll containment, shell/footer alignment, dynamic-height changes, normal About/Work touch scrolling, route return and desktop unlock. Physical iOS rubber-banding still requires device confirmation.
