---
name: verify-personal-website
description: Verify Yolanda's personal website routes, About interactions, facts, work filters, timeline and acknowledgements through Chromium. Use after website changes or when auditing its workflow.
---

# Verify personal website

## Launch

Run from the canonical `/Users/yolanda/Documents/ChatGPT/personal website` checkout:

```sh
/Users/yolanda/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node .agents/skills/verify-personal-website/run.cjs /private/tmp/website-verification-RUN all
```

Choose a fresh evidence directory for each run. Replace `all` with `navigation`, `about`, `facts`, `work`, or `acknowledgements` for a targeted run. No build, credentials or seed data are needed. The helper starts a private HTTP server bound to 127.0.0.1 on an OS-assigned port and its own Chromium context, then tears both down. It serves public website files only, excluding repository metadata, skills and mockups. Concurrent runs use separate ports, browser contexts and evidence directories. Browser runtime: bundled Playwright; `PLAYWRIGHT_MODULE` can override its module location. Install its matching Chromium with Playwright's `install chromium` command if absent.

## Doctor

Before driving, the helper requests its owned server's `/__doctor` endpoint and checks the canonical root and Git revision. The endpoint is read-only and records its process ID in `doctor.json`. After a failed drive, the helper closes everything; rerun with a fresh evidence directory so doctor executes again. Do not attach to or kill a user's browser/server.

## Drive

Read `features/README.md` and the selected recipe. The helper drives actual buttons, links, keyboard keys, text input and scrolling. DOM reads are observations; do not replace actions with hash setters, internal state mutation or dispatched synthetic application events. Social links are checked for their href/new-tab contract; external websites are not opened. The work test checks filters, timeline spacing, desktop and 390/320px layouts, and the absence of the removed circuit cat.

## Evidence

Each run writes action notes, pass/fail results, canonical revision, full-page screenshots, ARIA snapshots, a Playwright trace and video into the supplied directory.  Inspect desktop and narrow screenshots and observe the complete animation sequence, including its loop boundary, before claiming visual/motion quality. Passing assertions establish tested behavior only. Copy email verifies the browser clipboard in an isolated context. Screenshots are evidence of rendered appearance, not proof of all interactions. Failed and partial runs retain evidence and report errors. Random facts may return the same result; test completion and result structure, not uniqueness across runs. No remote writes or publishing occur.

## Cleanup

A `finally` block closes the isolated browser context, browser and exact HTTP server created by the run. It never kills by process name or deletes evidence. Check `results.json` exists after exit and its cleanup field records teardown. A nonzero exit means failure, not verified completion.

## Helpers

`run.cjs` is executable. Invoke it with the bundled Node command above; it accepts evidence directory then feature ID. The feature map is the maintained source of coverage. During maintenance, edit only this skill directory; report product regressions separately.
