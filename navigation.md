# Terminal navigation

Approved 2026-10-07: implement browser-only animated navigation and suggestions without an API.

- Keep the header identity `yolanda@web:~` as a home link. Use `$` in the footer.
- Cycle the empty, unfocused placeholder through work, projects, and about me with typing and deletion. Pause on focus and while the page is hidden. Reduced motion uses a static placeholder.
- Match destination labels and aliases locally, ignoring capitalization and repeated spaces. Show an inline suffix for a matching label and a selectable destination list.
- Arrow keys select, Tab completes, Enter navigates, Escape dismisses. Support pointer and touch selection with visible focus and combobox semantics.
- Internal views use hash URLs: `#work`, `#projects`, `#about`. Keep Work History and Projects as explicit placeholders until content is supplied. Retain Connect as a profile-link view.
- GitHub: https://github.com/akaiyol
- LinkedIn: https://www.linkedin.com/in/yolanda-chen1/
- External profiles use ordinary navigation in the current tab and are labelled external. URLs were sourced from the user's local résumé files.
- Preserve the black and purple palette. Navigation suggestions sit above the footer and scroll within the available height.

## Verification

- Rendered desktop (1280 × 900) and mobile (390 × 844) input, suggestion list, and internal views.
- Browser checks passed for `wo` inline completion, Tab completion, arrow selection, Enter routing, Escape dismissal, no-match guidance, About, Home, and GitHub navigation. LinkedIn href matches the user-confirmed URL.
- Observed the live placeholder through typing, deletion, all three examples, and a repeat cycle.
- Deterministic timer checks passed for typed-text preservation, reduced-motion static text, and hidden-page pause. These preference/lifecycle checks were tested at the logic level rather than by changing OS settings.
- JavaScript syntax and Git whitespace checks passed; no browser errors observed.
