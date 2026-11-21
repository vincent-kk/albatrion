---
"@winglet/common-utils": patch
---

Publish updates made through a saved `getTrackableHandler` state manager immediately after its call finishes, even while another call awaits a lifecycle hook. Concurrent-call prevention now changes admission alone; each call owns its hook notification timing.
