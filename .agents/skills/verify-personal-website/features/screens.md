# Required rendered screen inventory

Render Home, About, Work and Acknowledgements, plus legacy Connect, at 1470×864, 1280×900, 820×1180, 390×844 and 320×740. Capture top viewport, full page and the scrolled bottom of every long page. Capture terminal suggestions, About gacha and gallery, the horizontal character card and gallery-photo dialog, Work stats shown and the full flower field at every size. Capture every work filter at 1470 and 390 pixels. Verify archived #projects resolves to Home. External GitHub/LinkedIn pages, historical studies and archived Projects are not application screens.

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

Use `render-screens.py --phone` for touch-enabled mobile emulation at320×740,375×812,390×844,430×932 and844×390. The renderer activates buttons and photo dialogs with touchscreen taps, captures phone stats as an overlay, verifies stable backing timeline geometry, input text of at least16px, shared shell/footer bounds, visible landscape Home actions and reachable photo details. Visible lazy images are awaited only when their clipped viewport region is relevant; long pages are scrolled before full-page capture. Inspect all portrait and landscape captures. Emulator checks do not replace physical iPhone/Android testing or the OS virtual keyboard.
