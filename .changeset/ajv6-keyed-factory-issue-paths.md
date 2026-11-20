---
"@canard/schema-form-ajv6-plugin": patch
---

Preserve native schema paths when `createValidatorFactory(ajv, key)` selects a registered document or fragment, and use the selected schema to populate `rejectedKey` for a single-key `not.required` constraint.
