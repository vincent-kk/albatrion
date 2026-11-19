---
"@winglet/json": patch
---

Ignore object members whose merge-patch value is `undefined`, as if those members were omitted. `mergePatch` no longer adds an empty object for an absent optional value, including nested and reserved-name members.
