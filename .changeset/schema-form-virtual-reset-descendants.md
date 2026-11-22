---
"@canard/schema-form": patch
---

`resetSubtree()` on a virtual group now also clears a value retained by an inactive descendant of one of its fields when the loaded value omits it, exactly as calling `resetSubtree()` on that field does. Before, the stale value came back when the descendant became active again.
