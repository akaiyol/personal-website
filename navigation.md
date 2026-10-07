# Terminal navigation

Approved 2026-10-07: implement browser-only animated navigation and suggestions without an API.

- Keep the header identity `yolanda@web:~` as a home link. Use `yolanda@web ~ %` as the footer shell prompt.
- Demonstrate work, projects, and about me once with typing and deletion. Finish at an empty prompt with a blinking rectangular cursor. Focusing the input ends the demonstration permanently for that page load. Pause while hidden. Reduced motion skips typing and uses a stationary block cursor.
- Match destination labels and aliases locally, ignoring capitalization and repeated spaces. Show an inline suffix for a matching label and a selectable destination list.
- Arrow keys select, Tab completes, Enter navigates, Escape dismisses. Support pointer and touch selection with visible focus and combobox semantics.
- Internal views use hash URLs: `#work`, `#projects`, `#about`. Keep Work History and Projects as explicit placeholders until content is supplied. Retain Connect as a profile-link view.
- GitHub: https://github.com/akaiyol
- LinkedIn: https://www.linkedin.com/in/yolanda-chen1/
- External profiles use ordinary navigation in the current tab and are labelled external. URLs were sourced from the user's local résumé files.
- Preserve the black and purple palette. Navigation suggestions sit above the footer and scroll within the available height.

## Initial implementation verification

- Rendered desktop (1280 × 900) and mobile (390 × 844) input, suggestion list, and internal views.
- Browser checks passed for `wo` inline completion, Tab completion, arrow selection, Enter routing, Escape dismissal, no-match guidance, About, Home, and GitHub navigation. LinkedIn href matches the user-confirmed URL.
- Previous version: observed the repeating placeholder cycle; superseded by the one-time demonstration below.
- Deterministic timer checks passed for typed-text preservation, reduced-motion static text, and hidden-page pause. These preference/lifecycle checks were tested at the logic level rather than by changing OS settings.
- JavaScript syntax and Git whitespace checks passed; no browser errors observed.

## Terminal refinement — 2026-10-07

- User requested a stronger macOS Terminal reference, a full identity prompt, a waiting rectangular cursor after the demonstration, and consistent recommendation typography and spacing.
- Visual decisions are recorded in `design.md`, with an open notes area for continued design discussion.
- Cursor follows the insertion point, accounts for horizontal input scrolling, and becomes solid briefly while typing. Native caret is replaced visually; the real input retains keyboard editing and selection.

- Follow-up decision: remove visible footer instruction text. Keep accessible input guidance without displaying a tutorial line; express navigation affordances through the prompt, cursor, and suggestions.

### Refinement verification

- Observed the live work → projects → about me typing/deletion demonstration finish at an empty prompt without repeating.
- Rendered desktop and narrow-screen candidates, full shell prompt, and block insertion cursor. Command input and candidates share the same computed font size. No horizontal document overflow observed.
- Verified Tab completion, left-arrow cursor movement, Enter navigation, Home return, and Escape dismissal. Visible footer instructions are absent; accessible guidance remains.
- Deterministic timer checks passed for one-time completion, waiting prompt, insertion-character display, selection handling, and reduced-motion termination.
