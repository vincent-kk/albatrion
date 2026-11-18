---
"@winglet/style-utils": patch
---

Document that functions returned by `styleManagerFactory`, including cleanup functions, must be discarded after `destroyScope`. Create a new factory before injecting again; reusing an old injector can leave styles outside the scope registry.
