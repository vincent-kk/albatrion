---
"@canard/schema-form-antd5-plugin": patch
---

Read-only checkboxes, switches, radio groups, checkbox groups, enum selects, sliders, time pickers and date, month and time range pickers are now disabled, so a read-only form no longer shows a choice it did not store. Before, these widgets accepted a click or keyboard change and displayed the new choice while `getValue()` and submission kept the previous value.
