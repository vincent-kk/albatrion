---
"@winglet/react-utils": patch
---

Calling a retained useTimeout schedule function after unmount no longer creates a timer or invokes its callback.
