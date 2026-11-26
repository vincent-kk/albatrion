---
"@canard/schema-form-mui-plugin": patch
---

`formRef.current.focus(path)` now focuses the visible enum Select, the URI address field and the editable sections of the date, month and time pickers, and clicking a field label focuses an enabled picker's editable sections. Before, focus could land on a hidden native input.
