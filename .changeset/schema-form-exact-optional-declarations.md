---
"@canard/schema-form": patch
---

Schema value declarations now compile with `exactOptionalPropertyTypes` enabled. `InferValueType` preserves readonly tuple normalization while requiring a present `type` before delegating typed-schema inference.
