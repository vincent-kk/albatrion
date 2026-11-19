---
'@canard/schema-form': patch
---

`resetSubtree()` on a virtual group restores its underlying fields from their loaded values instead of deleting them. Inside a batch, writes through a virtual group and resets of its fields now respect the same storage scope and call order as sequential calls.
