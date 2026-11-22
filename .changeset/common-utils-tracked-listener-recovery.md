---
"@winglet/common-utils": patch
---

`getTrackableHandler` clears its running state when a start notification throws, so a subscriber failure no longer permanently prevents later calls.
