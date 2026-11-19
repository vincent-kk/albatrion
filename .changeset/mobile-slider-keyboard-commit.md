---
"@canard/schema-form-antd-mobile-plugin": patch
---

Sliders with omitted `presentation.FieldInputProps.lazy` publish keyboard selections on key up, matching pointer commits. `lazy: false` still publishes every move, and the first pointer selection of the minimum stores an unset value. Keyboard stepping follows schema bounds and marks without the library's drag keyboard handler overwriting it.
