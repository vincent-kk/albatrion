---
"@canard/schema-form-antd-mobile-plugin": patch
---

Read-only radio groups, checkboxes, checkbox groups and sliders are now disabled, so a read-only form no longer shows a choice it did not store. Before, these widgets accepted a tap and displayed the new choice while `getValue()` and submission kept the previous value.
