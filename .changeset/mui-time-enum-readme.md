---
"@canard/schema-form-mui-plugin": patch
---

The README now describes the time picker and the enum select as they behave. The time picker stores `HH:mm:ss` without a time-zone offset; the README previously said `HH:mm:00Z`. The enum select handles a single string value; the README previously also listed string arrays, which this plugin selects with the checkbox group when `presentation.inputType` is `'checkbox'`.
