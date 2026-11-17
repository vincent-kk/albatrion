---
"@canard/schema-form": patch
---

Apply the current committed Form readOnly and disabled settings to delayed input callbacks. Locking blocks pending edits and unlocking permits them, including callbacks invoked by child layout effects after a lock update.

Concurrent updates that have not committed keep the previous locks. A suspended input does not imply an uncommitted Form: React 18 legacy roots can commit the new locks together with the Suspense fallback.

File attachment callbacks also respect Form and field locks when replacing or removing files, including attachment relays on a child input or a renderer's Input. Unlocking lets callbacks from the same live input attach files again.
