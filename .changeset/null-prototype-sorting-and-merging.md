---
"@winglet/common-utils": patch
---

Keep null prototypes when `sortObjectKeys` copies a dictionary. Sorting no longer introduces inherited values for absent keys such as `constructor`.
