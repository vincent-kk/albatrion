---
"@canard/schema-form-mui-plugin": patch
---

Read-only radio groups, checkbox groups, boolean checkboxes and sliders are now disabled, so a read-only field no longer shows a choice it did not store. Before, these widgets accepted a click or key press and displayed the new choice; in a field made read-only by its schema, `getValue()` kept the previous value.
