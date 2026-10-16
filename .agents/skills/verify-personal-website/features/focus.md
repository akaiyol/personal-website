# Activation focus release

Run the verification helper with feature ID `focus`. The shared focus-release handler applies to buttons, links and role buttons, including dynamically created controls.

Verify mouse click, Enter and Space on Home actions, terminal Go, copy email, Roll, portrait and all gallery photos, dialog close, every work filter and per-role tag, stats visibility and comparison. Assert the activated control no longer owns focus, while pressed/expanded state remains correct. Opening a dialog must retain its new focus; closing it releases restored photo-trigger focus. Tab focus remains available until activation. Check page shortcuts after activation and the narrow stats toggle. External links are not activated; hidden or decorative controls are not actionable buttons. Random fact photo tags are tested when present in a roll.

Evidence: focus-coverage.json lists controls and input modes exercised; screenshots show post-activation states. DOM focus assertions, rather than screenshot appearance alone, establish deselection. The test uses reduced motion to avoid waits for unrelated animations; motion is not under test.
