---
'@canard/schema-form': patch
---

Control expressions preserve division of numbers written with a leading decimal point. In `.5/2 + ../a`, only `../a` is resolved as a field path.
