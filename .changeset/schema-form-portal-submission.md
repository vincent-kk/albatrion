---
"@canard/schema-form": patch
---

Submitting a Form rendered through a portal now submits only that Form. Ancestor Forms in the React tree no longer validate, reveal errors, move focus or invoke onSubmit for the dialog’s native submit event.
