---
"@canard/schema-form-mui-plugin": patch
---

A slider whose form value is unset no longer displays the schema `minimum` as if it were stored. Until the first change it hides the thumb and value label and omits `aria-valuenow`; it stays reachable and operable by keyboard and pointer, and the thumb shows while it has keyboard focus. The slider never writes a value on its own, and resetting the field to `undefined` returns it to this state.
