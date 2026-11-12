---
"@canard/schema-form": patch
---

Read default and reset snapshots from own properties only. Reserved field names such as `constructor` and `__proto__` remain ordinary data when writing defaults or aligning array slots, without changing object prototypes.

Reuse decoded paths during snapshot writes to reduce their cost while retaining own-property checks.
