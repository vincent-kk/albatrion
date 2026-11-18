---
"@canard/schema-form": patch
---

Treat `$schema` identifiers with and without a trailing empty `#` fragment as the same dialect. Equivalent draft identifiers no longer report `DIALECT_MISMATCH`; warnings for different dialects remain.
