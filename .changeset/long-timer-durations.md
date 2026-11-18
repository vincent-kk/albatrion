---
"@winglet/common-utils": patch
---

Preserve waits longer than the platform timer limit in `delay`, `timeout`, `withTimeout`, `debounce`, and `throttle` instead of firing after about one millisecond. Long finite waits use cancellable timer segments, and `Infinity` waits until cancellation.
