---
"@canard/schema-form": major
---

Breaking: a nullable array or object field whose value is `null` now reads `null` from `node.value` and from the FieldInput `value` prop, instead of `[]` or `{}`. This matches `getValue()`, the `options.terminal: true` behavior and the documented difference between "no list" (`null`) and "empty list" (`[]`). A custom FieldInput for a nullable array or object must handle `null` before reading the value.

```tsx
// Before: value was [] while the field was null
const TagsInput = ({ value }: FieldInputProps<string[] | null>) => (
  <ul>{value.map((tag) => <li key={tag}>{tag}</li>)}</ul>
);

// After: value is null while the field is null
const TagsInput = ({ value }: FieldInputProps<string[] | null>) => (
  <ul>{(value ?? []).map((tag) => <li key={tag}>{tag}</li>)}</ul>
);
```
