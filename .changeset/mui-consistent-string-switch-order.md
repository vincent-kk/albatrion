---
"@canard/schema-form-mui-plugin": major
---

Breaking change: string switches now store `enum[0]` when checked and `enum[1]` when unchecked, consistently with the other UI plugins. In 0.x the MUI switch stored `enum[1]` when checked.

Swap the two enum values, and the schema's `switchLabels` tuple with them, to keep the stored values:

```ts
// Before
const before = {
  type: 'string',
  formType: 'switch',
  enum: ['off', 'on'],
  switchLabels: ['Off', 'On'],
};

// After
const after = {
  type: 'string',
  enum: ['on', 'off'],
  switchLabels: ['On', 'Off'],
  presentation: { inputType: 'switch' },
};
```
