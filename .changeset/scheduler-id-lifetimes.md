---
"@winglet/common-utils": patch
---

Keep `MessageChannelScheduler` task IDs unique across instance destruction and recreation. A stale cancellation ID no longer cancels a different task scheduled later, including tasks created through the global scheduling helpers.
