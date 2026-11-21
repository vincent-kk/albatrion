---
"@canard/schema-form-ajv8-plugin": patch
---

Support hosts without `WeakRef` or `FinalizationRegistry`, including Safari 14.0, without a polyfill. Validation and explicit `release(root)` remain available; call `release(root)` when finished because automatic garbage-collection cleanup is unavailable on those hosts.
