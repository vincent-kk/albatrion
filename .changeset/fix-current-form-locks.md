---
"@canard/schema-form": patch
---

Apply the current committed Form readOnly and disabled settings to delayed input callbacks. Locking blocks pending edits, unlocking permits them, and suspended renders do not change the active form’s lock state.
