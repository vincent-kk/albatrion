---
'@canard/schema-form': patch
---

The documentation and the packaged agent skill now state where a path in an expression ends. Only whitespace and a parenthesis always end a path, so `../items.length`, `../list[0]` and `../count>5` read a property of that literal name; write `(../items)?.length`, `(../list)[0]`, `(../limits)[(../tier)]` and `../count > 5`. A comma written directly after a path is read as part of it, and `(../price)/100` reads `/100` as a path, so these either fail to compile or read the wrong path: write `Math.max(../a , ../b)` and `(../price) / 100`. Behavior is unchanged.
