---
"@winglet/common-utils": patch
---

Clarify the host-specific ordering of `scheduleMacrotask` and `scheduleCancelableMacrotask`. Node may run nested microtasks between native callbacks, while the browser fallback runs synchronously queued tasks in one batch.
