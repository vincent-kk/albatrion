---
'@canard/schema-form': patch
---

Control statement bodies preserve regular expression literals after `return` and other operand-leading keywords. For example, `{ return /^\d+$/.test(../code); }` now behaves like the equivalent expression instead of treating its pattern as a field path.

Character classes also remain regular expression text, including unescaped slashes inside the class; only field references outside the literal are resolved.
