---
"@winglet/json": patch
---

`getJSONPointer` retains empty-string path segments below the root, including before array indexes. Its returned pointer now reads back the requested value through `getValue`.
