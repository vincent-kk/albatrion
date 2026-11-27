---
"@canard/schema-form": major
---

Breaking change: `required` inside `presentation.FieldInputProps` (0.16 `FormTypeInputProps`) no longer changes the input's `required` prop. Move it to the new schema key `presentation.required`, which sets the required indicator of both the field renderer and the input.

```ts
// Before (0.16)
{ type: 'string', FormTypeInputProps: { required: false } }

// After
{ type: 'string', presentation: { required: false } }
```

A boolean `required` on a child field, `Form.Input`, `Form.Render` or `Form.Field` takes precedence over a boolean `presentation.required`, which takes precedence over the schema requirement. In 0.16 that override reached only the input while the field renderer always received the schema requirement; now the resolved value reaches both, including when only the parent changes it and when it returns to `undefined`. `false` is respected. `required` inside `presentation.FieldRendererProps` has no effect, as `FormTypeRendererProps.required` had none in 0.16. Schema validation and input selection still follow the schema's `required` constraint. A boolean `required` that a renderer passes to its `Input` applies to that input only; `undefined` falls through without clearing the shared value. An input that forwards `required` to a native element can still affect browser validation.
