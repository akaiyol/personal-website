---
name: maintain-personal-website-verification
description: Audit and maintain the personal website verification skill, feature map and Chromium harness when asked to maintain verification or when documented coverage has drifted.
---

# Maintain personal website verification

## When

Use for a verification audit or coverage update. Target [verify-personal-website](../verify-personal-website/SKILL.md) and its feature map. This is a project-local adaptation of Cursor's [maintain-verification-skill](https://github.com/cursor/plugins/tree/main/pstack/skills/maintain-verification-skill); verification was originally built using [create-verification-skill](https://github.com/cursor/plugins/tree/main/pstack/skills/create-verification-skill).

## How

- Verify the canonical checkout `/Users/yolanda/Documents/ChatGPT/personal website`, branch, status and revision. Preserve unrelated changes.
- Read the verification entrypoint and `features/README.md`. Match its links to sibling feature files. For each mapped feature, inspect its current source entry points and turn likely drift into a short user-action recipe. Check recent user-facing changes for missing coverage. Delegate source reading only when explicitly authorized; keep browser driving with one coordinator.
- Run the documented verification command with `all` in a fresh evidence directory. The harness owns one loopback server and Chromium session, health-checks it, drives features serially, and closes resources in `finally`. Inspect results and retained evidence. After a failed run, diagnose and launch a fresh health-checked run; do not reuse a surprising browser state.
- Classify findings: incorrect documentation is map drift; working behavior the harness misses is a coverage gap; broken application behavior is a product defect. Change only the verify skill directory during this maintenance pass. Report product defects separately; do not alter acceptance to hide them.
- Re-drive corrected tests and all affected features. Inspect actual desktop and 390/320px screenshots for visual claims, including both stats states. Use [critique-personal-website](../critique-personal-website/SKILL.md) for rendered judgment. Assertions alone do not establish visual quality. Preserve failed-run evidence.

## Output

Report clean, changed, or blocked, with feature coverage, confirmed corrections, evidence path and unverified behavior. Commit coherent proven corrections locally under project policy. Do not create a branch, PR, push or scheduled background task without user authorization. This local delivery rule intentionally replaces the upstream skill's PR requirement.

## Checks

Every mapped feature receives source review and a live drive during a full audit. Results must record failures honestly and teardown must complete. External links are checked by URL contract without opening third-party sites. Motion and physical-device behavior require their own evidence; do not infer them from screenshots or emulation. A new visual defect in product code belongs to a separately authorized fix, not a test relaxation.
