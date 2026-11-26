---
"@canard/schema-form-ajv6-plugin": patch
"@canard/schema-form-ajv7-plugin": patch
"@canard/schema-form-ajv8-plugin": patch
"@canard/schema-form": patch
---

The READMEs now state what a condition the AJV instance cannot compile does: it applies neither `then` nor `else` and reports `GUARD_FAILED`, instead of saying the gate becomes false. The `@canard/schema-form` agent skill notes that custom keywords on the instance decide `if` conditions.
