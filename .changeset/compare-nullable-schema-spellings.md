---
"@winglet/json-schema": patch
---

Make `isIdenticalSchemaType` compare nullability even when both schemas use the same type string or array. OpenAPI `nullable: true` and a JSON Schema type array containing `null` now produce consistent comparisons, including singleton arrays and the already-null type.
