---
"@canard/schema-form-antd-mobile-plugin": patch
---

The README now lists the input priority in the order the plugin applies it: `FieldInputSlider` comes before `FieldInputArray`, so a numeric array schema with `format: "slider"` gets the slider rather than the generic array editor.
