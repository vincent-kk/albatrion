---
"@canard/schema-form": patch
---

Document that legacy node10 TypeScript resolution can lose types on root APIs such as FormHandle.submit because transitive dependency subpath declarations do not resolve. Recommend bundler, node16 or nodenext resolution.
