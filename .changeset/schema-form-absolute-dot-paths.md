---
'@canard/schema-form': patch
---

Absolute control, `watch`, and `injectTo` paths containing `.` or `..` now resolve like the same paths passed to `findNode`. For example, `/group/../name` and `/name` address the same field.
