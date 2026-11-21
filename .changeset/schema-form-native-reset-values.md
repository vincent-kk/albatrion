---
'@canard/schema-form': patch
---

A native reset button now performs the same form-value reset as `FormHandle.reset()`, including the same `onChange` and reset lifecycle. The browser still resets unmanaged native controls; the form restores its managed state immediately afterward in the same task's microtask checkpoint.
