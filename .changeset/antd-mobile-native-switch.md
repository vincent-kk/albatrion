---
"@canard/schema-form-antd-mobile-plugin": major
---

Breaking change. Ant Design Mobile Switch inputs use the library's pointer interaction. Tab and `formRef.current.focus(path)` no longer focus these switches. Space and Enter no longer toggle them. To keep keyboard behavior, register a custom `FieldInput` with a keyboard-accessible switch or native checkbox and forward the bound value, change handler and lock state.
