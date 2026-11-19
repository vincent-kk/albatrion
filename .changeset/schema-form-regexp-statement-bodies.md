---
'@canard/schema-form': patch
---

Control statement bodies preserve regular expression literals after `return` and other operand-leading keywords. For example, `{ return /^\d+$/.test(../code); }` now behaves like the equivalent expression instead of treating its pattern as a field path.
