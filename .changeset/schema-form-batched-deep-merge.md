---
"@canard/schema-form": patch
---

`setValue` with `SetValueOption.Merge` now retains omitted nested object keys inside `batch` and `visitSubtree`, just as it does outside a batch. Updaters after a Merge see those retained keys, and inactive branch values omitted by the partial update remain available when that branch returns.

When an input object defines getters, a batched Merge uses the observed property values for the write. A Merge settled before `resetSubtree()` uses the same value for the write and for restoring any earlier writes if the reset is refused.
