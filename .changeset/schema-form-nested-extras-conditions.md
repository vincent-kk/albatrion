---
"@canard/schema-form": patch
---

Read nested additional-property values from their own object when evaluating conditional paths. An ancestor field with the same name no longer replaces the nested value and incorrectly activates or omits a field.
