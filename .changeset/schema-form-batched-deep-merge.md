---
"@canard/schema-form": patch
---

`setValue` with `SetValueOption.Merge` now retains omitted nested object keys inside `batch` and `visitSubtree`, just as it does outside a batch. Updaters after a Merge see those retained keys, and inactive branch values omitted by the partial update remain available when that branch returns.
