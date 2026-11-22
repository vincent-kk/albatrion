---
"@winglet/common-utils": patch
---

Keep null prototypes when immutable `merge` copies an existing target dictionary, including nested targets. Merging no longer introduces inherited values for absent keys such as `constructor`.
