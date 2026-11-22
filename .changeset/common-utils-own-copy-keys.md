---
"@winglet/common-utils": patch
---

`removeUndefined` and `sortObjectKeys` preserve an own `__proto__` key as data, including nested copies and both preferred and remaining sort keys. Copying these inputs no longer changes the result prototype.
