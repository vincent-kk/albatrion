---
"@lerx/promise-modal": patch
---

Keep a route-hidden manualDestroy modal hidden when it settles. Requests settled while shown retain their manual exit animation.

Nodes created by older compatible copies retain their earlier exit behavior because they do not record visibility at settlement. Update all copies to apply the hidden-settlement rule consistently.
