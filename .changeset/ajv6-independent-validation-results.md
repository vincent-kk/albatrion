---
"@canard/schema-form-ajv6-plugin": patch
---

Keep validation results independent when calls overlap on a shared compiled schema. An invalid value retains its own issues even when a later call succeeds, and successful asynchronous validation of falsy values returns `null`.
