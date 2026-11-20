---
"@canard/schema-form": patch
---

`controls.injectTo` and `controls.derived` that write a virtual group now distribute the tuple like `setValue` on the group: a defined value for an inactive field is kept for that field and appears when it becomes active, and a write to an inactive group still reaches its fields. Before, values for inactive fields were dropped and a write to an inactive group was lost.
