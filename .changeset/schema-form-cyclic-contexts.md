---
'@canard/schema-form': patch
---

`Form` and `FormProvider` finish comparing rebuilt contexts containing cycles through plain objects, arrays, or maps. Equal graph content keeps the current context snapshot, while changed values still propagate.
