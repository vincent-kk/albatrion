---
"@canard/schema-form-antd-mobile-plugin": major
---

Breaking change: input identifiers and group title addresses now use Form-scoped `id` and `labelId`, so selectors and labels based on JSON Pointer strings must migrate.

Custom inputs use `FieldInputProps.id` on the real control; `path` remains the data pointer. Custom group renderers use `FieldRendererProps.labelId` on the title and `aria-labelledby` on the group. Options have distinct identifiers, radio inputs use the scoped `id` as their native `name`, and other inputs retain their leaf names.

Before:

```tsx
const Input = ({ path, name }: FieldInputProps<string>) => (
  <input id={path} name={name} />
);
```

After:

```tsx
const Input = ({ id, name }: FieldInputProps<string>) => (
  <input id={id} name={name} />
);
```

Replace `document.getElementById('/email')` with a selector scoped to the intended Form, such as `formElement.querySelector('[data-path="/email"] input')`, or retain the control's supplied `id` when connecting a label. Native radio submission keys are scoped; values returned by the Form API retain the schema shape.
