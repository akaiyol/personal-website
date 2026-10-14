# Project instructions

## Scope and sources of truth

- Follow the user's latest instructions and approved design direction.
- Use `design.md` for visual rules and the relevant feature files for behaviour.
- Keep visual rules, feature specifications, and agent workflow instructions in their respective files.
- Implement only the requested scope. Do not add features, change copy, or introduce a new aesthetic without authorization.

## UX and design quality before delivery

Review the finished result before presenting it as complete. Fix concrete issues within the authorized scope, then verify the affected result again.

For visual changes, use `.agents/skills/critique-personal-website/SKILL.md` to run the rendered critique and correction loop before delivery. Use `.agents/skills/verify-personal-website/SKILL.md` for functional checks and `.agents/skills/maintain-personal-website-verification/SKILL.md` when auditing or maintaining verification coverage.

### Design fidelity

- Compare the rendered result with the user's request, approved references, `design.md`, and applicable feature specifications.
- Assess the intended mood and visual character, not just whether the requested elements exist.
- Check composition, alignment, spacing, typography, hierarchy, colour, and character-art legibility.
- Apply the two-colour palette consistently across artwork and interface states.
- Remove accidental clutter, clipping, overlaps, inconsistent spacing, and visual treatments that conflict with the approved direction.

### Usability

- Keep primary content readable and actions easy to identify.
- Verify that visible controls perform their stated actions and provide understandable feedback.
- Check keyboard operation, visible focus, usable target sizes, and relevant empty or error states.
- Ensure decorative artwork does not obscure content, intercept input, or overwhelm the page's purpose.
- Preserve semantic text equivalents for character-built headings and hide purely decorative artwork from assistive technology.

### Responsive composition

- Inspect actual rendered desktop and narrow-screen layouts after visual changes.
- Check horizontal overflow, artwork clipping, wrapping, spacing, and control accessibility.
- Keep ordinary text readable rather than shrinking the whole page to fit.
- Adapt composition to available space while preserving the intended visual hierarchy.

### Motion quality

- Observe at least one complete sequence of any changed animation, including its transition into the next sequence.
- Assess direction, timing, continuity, weight, and the intended emotional effect.
- Check that motion remains contained and does not cause layout shifts or interfere with reading.
- Verify a suitable static presentation for reduced-motion preferences and that hidden-page animation work pauses.
- Do not judge animation quality from a single screenshot or source inspection alone.

## Verification and reporting

- Use rendered inspection and relevant interaction checks as evidence. Run code checks appropriate to the change.
- Separate confirmed observations from assumptions and unverified behaviour.
- If verification is blocked, identify the specific limitation; do not claim the affected requirement passed.
- Keep the delivery message concise: describe the result, provide the preview or file link, and mention material limitations.
- Do not declare a design finished solely because it runs without errors. It must also satisfy the requested appearance and user experience.

## Automatic Git commits

- Automatically create a local Git commit after an important approved decision is recorded or implemented, and at the end of a long work session with meaningful changes. Treat a session lasting roughly one hour or spanning several substantial changes as a long session; commit coherent checkpoints during extended work.
- Do not ask for confirmation for these commits. Record important decisions in the appropriate project specification before committing.
- Review the diff and run checks appropriate to the changes before committing. Stage only files or hunks belonging to the current task; preserve unrelated user changes.
- Use a concise, descriptive commit message that identifies the decision or completed checkpoint. If work is incomplete, label the commit as a checkpoint and record outstanding work and verification limitations.
- Do not create empty commits, include secrets or generated temporary files, or push to a remote unless the user has authorized pushing. Report the commit hash and any commit failure in the delivery message.

## Communication

- Write professionally, clearly, and concisely.
- Use precise terms and avoid repetition, filler, emojis, and unsupported claims.
- Ask for clarification when unresolved ambiguity materially affects the outcome. Proceed with routine reversible decisions within the approved scope.

## Canonical checkout and previews

- The canonical website checkout is `/Users/yolanda/Documents/ChatGPT/personal website` on `main`.
- Before editing or previewing, verify the checkout, branch, and working-tree status. If this chat is in a different checkout, inspect differences and integrate approved changes into the canonical checkout before presenting a latest preview.
- Use the canonical checkout for website work unless Yolanda explicitly requests an isolated worktree. Do not create another worktree by default.
- Preview the canonical `index.html`, not a mockup or an old worktree. State whether opening or refreshing actually succeeded.
- Commit completed work locally. A commit in another worktree is not integration into `main`.
