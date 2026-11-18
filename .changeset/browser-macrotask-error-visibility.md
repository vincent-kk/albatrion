---
"@winglet/common-utils": patch
---

Report callback failures from browser `scheduleMacrotask` and `scheduleCancelableMacrotask` to the host through `reportError` or a separately scheduled throw. Direct `MessageChannelScheduler` usage without `onTaskError` keeps its existing error policy.
