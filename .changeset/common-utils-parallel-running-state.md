---
"@winglet/common-utils": patch
---

`getTrackableHandler` keeps `pending` true until every outstanding call completes when `preventConcurrent` is false.
