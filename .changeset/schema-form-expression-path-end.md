---
'@canard/schema-form': patch
---

The documentation and the packaged agent skill now state where a path in an expression ends. A path runs until whitespace or a parenthesis, so `../items.length`, `../list[0]` and `../count>5` read a property of that literal name; write `(../items)?.length`, `(../list)[0]`, `(../limits)[(../tier)]` and `../count > 5`. A comma or a division slash written against a path fails to compile: write `Math.max(../a , ../b)` and `(../price) / 100`. Behavior is unchanged.
