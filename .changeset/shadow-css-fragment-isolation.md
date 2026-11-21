---
"@winglet/style-utils": patch
---

Close each shadow-root style fragment at its CSS end-of-input boundary before joining the next identifier. An unfinished comment, string, URL, component, or statement no longer consumes another identifier's stylesheet.
