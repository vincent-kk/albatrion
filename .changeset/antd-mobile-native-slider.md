---
"@canard/schema-form-antd-mobile-plugin": major
---

Breaking change. Tab and `formRef.current.focus(path)` no longer focus Ant Design Mobile Slider thumbs, and keyboard input no longer moves the thumbs or commits a value. Pointer changes continue to use the schema bounds and step. To keep keyboard interaction, register a custom `FieldInput` with a keyboard-accessible slider and forward the bound value, change handler and lock state.
