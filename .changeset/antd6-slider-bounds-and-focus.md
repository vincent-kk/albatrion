---
"@canard/schema-form-antd6-plugin": patch
---

Sliders honor numeric `exclusiveMinimum` and `exclusiveMaximum`, and a slider whose schema leaves no selectable stop is disabled. `formRef.current.focus(path)` now focuses an editable slider's thumb. In a read-only `number` field without `multipleOf`, the slider shows an in-range decimal value at its exact position; in a read-only `integer` field it shows a grid point and keeps the stored value.
