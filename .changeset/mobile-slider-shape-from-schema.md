---
"@canard/schema-form-antd-mobile-plugin": major
---

Breaking change: the slider no longer reads `range`; its shape follows the schema type. A `number` or `integer` schema with `format: "slider"` renders a single thumb and stores a number, and a numeric array schema with `format: "slider"` renders a two-thumb range slider and stores a two-number array.

In 0.x, `options.range: true` on a number schema rendered two thumbs and stored an array in the number field, which contradicts the schema. In 0.x a numeric array schema with `format: "slider"` rendered the generic array editor instead. To keep a range slider, declare the field as an array of numbers:

```ts
// Before
const before = {
  type: 'number',
  format: 'slider',
  options: { range: true },
};

// After
const after = {
  type: 'array',
  items: { type: 'number' },
  format: 'slider',
};
```

A schema that still sets `range`, under `options` or `presentation.FieldInputProps`, loads without errors, and the setting has no effect. The range slider keeps a stored two-number default and writes only two-number arrays. Its thumbs appear in ascending order, and mounting keeps the stored order: the form keeps `[80, 20]` while the thumbs appear at `20` and `80`.
