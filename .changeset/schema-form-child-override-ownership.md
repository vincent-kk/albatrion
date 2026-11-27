---
"@canard/schema-form": major
---

Breaking change: `value` and `defaultValue` are no longer override props on child fields (the `ChildFields` items, 0.16 `ChildNodeComponents`), `Form.Input`, `Form.Render` or `Form.Field` (0.16 `Form.Group`). In 0.16 a `value` or `defaultValue` passed there replaced the one the input received, so the input could display a value different from its node; now both props are typed `never` and the input always receives the node's value.

```tsx
// Before: the override replaced the value the input received.
<Child defaultValue="Ada" />

// After: initialize values at the Form boundary.
<Form jsonSchema={schema} defaultValue={{ name: 'Ada' }} />
// For later writes, use the parent's onChange or the Form handle.
```
