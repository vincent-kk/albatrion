---
"@canard/schema-form": patch
---

The Form.Label password example now declares format: password in the schema and renders Form.Input without a type override. The example produces a masked input while preserving the schema-owned meaning of FieldInputProps.type.
