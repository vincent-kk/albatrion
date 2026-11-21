---
"@canard/schema-form": patch
---

`node.watchValues` and the FieldInput `watchValues` prop now keep the same array reference while every watched value is unchanged, also across unrelated edits elsewhere in the form. A `useMemo` or effect that depends on `watchValues` no longer reruns on every commit.
