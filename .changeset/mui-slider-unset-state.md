---
"@canard/schema-form-mui-plugin": patch
---

A slider whose form value is unset no longer displays the schema `minimum` as if it were stored. Until the first change it hides the thumb and value label, omits `aria-valuenow` and announces `Not set` through `aria-valuetext` (set `presentation.FieldInputProps.unsetValueText` to change the phrase); it stays reachable and operable by keyboard and pointer, and the thumb shows while it has keyboard focus. The first committed choice is stored even when it equals the minimum (Home, or releasing the pointer on the minimum). The slider never writes a value on its own, and resetting the field to `undefined` returns it to this state.
