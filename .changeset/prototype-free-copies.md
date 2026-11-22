---
"@winglet/common-utils": patch
---

Preserve null prototypes when `shallowClone` and `removeUndefined` copy prototype-free dictionaries. Absent keys such as `constructor` and `toString` remain absent instead of resolving to inherited members.
