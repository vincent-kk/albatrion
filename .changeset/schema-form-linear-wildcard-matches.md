---
'@canard/schema-form': patch
---

Large wildcard `findNodes` queries avoid quadratic duplicate checking while preserving result order and node identity. Small result sets retain direct array lookup without allocating an index.
