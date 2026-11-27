---
"@canard/schema-form": patch
---

Pass RFC 6901 pointers to `Validator.compileGuard`, including conditions beneath properties named `*`, `.`, `..` or `@`. Validator plugins should interpret only `~0` and `~1` pointer escapes and must not decode form-path percent escapes.
