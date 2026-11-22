---
"@winglet/common-utils": patch
---

Keep `MessageChannelScheduler` running when `onTaskError` throws. Other tasks and later batches still run once, and the handler failure is reported to the host.
