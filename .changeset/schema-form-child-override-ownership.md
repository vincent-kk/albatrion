---
"@canard/schema-form": minor
---

Breaking change: `value` and `defaultValue` are no longer override props on child inputs or `Form.Input`, `Form.Render`, and `Form.Field`. Values belong to the form node; untyped overrides cannot replace them.

```tsx
// Before: a child override could display a value different from its node.
<Child defaultValue="Ada" />

// After: initialize values at the Form boundary.
<Form jsonSchema={schema} defaultValue={{ name: 'Ada' }} />
// For subsequent writes, use the parent's onChange or the Form handle.
```

Breaking change: `presentation.FieldInputProps.required` no longer changes the input required prop; move it to `presentation.required`. Required in `presentation.FieldRendererProps` is also ignored because the binding owns both props.
```tsx
// Before
presentation: { FieldInputProps: { required: false } }
// After
presentation: { required: false }
```

A boolean required override on Child, Form.Input, Form.Render or Form.Field takes precedence over boolean `presentation.required`, then the schema requirement. The resolved display value reaches both renderer and input, including parent-only changes and returning to undefined. False is respected. Schema validation and input selection still follow the schema required constraint. A boolean required on a renderer Input remains an input-only author choice; undefined falls through without clearing the shared value. Inputs forwarding required to native elements may still affect browser validation.
