---
"@canard/schema-form-antd-mobile-plugin": major
---

Breaking: the slider's shape now follows the schema type, and `presentation.FieldInputProps.range` is ignored. A numeric array schema with `format: "slider"` always renders a range slider, keeps its two-number default and writes only two-number arrays; a number or integer schema always renders a single thumb and writes only numbers.

Before, an array schema without `range: true` rendered a single thumb, dropped its array default and wrote one number into the array field, while a number schema with `range: true` wrote an array into the number field. Both produced values that contradict the schema.

To keep a range slider, declare the field as a numeric array; the `range` setting is no longer needed:

```ts
// Before
const before = {
  type: "number",
  format: "slider",
  presentation: { FieldInputProps: { range: true } },
};

// After
const after = {
  type: "array",
  items: { type: "number" },
  format: "slider",
};
```

Schemas that still set `range` keep loading without errors; the setting has no effect.
