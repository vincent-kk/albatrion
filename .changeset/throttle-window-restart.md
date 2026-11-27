---
"@winglet/common-utils": patch
---

Fix `throttle` restarting after `clear()` and at exact timer boundaries. Trailing-only calls are delivered, and callbacks can schedule another call without synchronous recursion.
