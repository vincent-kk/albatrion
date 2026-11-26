---
"@canard/schema-form-mui-plugin": minor
---

An unset slider hides its resting thumb and announces `Not set` until a value is chosen; set `presentation.FieldInputProps.unsetValueText` to localize the announcement. Before, an unset slider showed its thumb at the minimum. Choosing the initial stop as the first selection stores that value, including with `lazy: false`. The slider honors numeric `exclusiveMinimum` and `exclusiveMaximum`, is disabled when the schema leaves no selectable stop, and Page Up, Page Down and Shift with an arrow key move it by ten slider steps instead of a fixed 10.
