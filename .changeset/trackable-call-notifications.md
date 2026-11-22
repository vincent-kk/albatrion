---
"@winglet/common-utils": patch
---

Keep state notifications attributed to their own invocation when `getTrackableHandler` allows concurrent calls. Nested hooks no longer publish extra notifications, and one call awaiting a hook no longer suppresses another call's detached state updates.
