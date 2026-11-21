---
"@canard/schema-form-antd5-plugin": major
---

Breaking change: input identifiers and group title addresses now use Form-scoped `inputId`, `labelId`, and `getInputId(key)`, so selectors and labels based on JSON Pointer strings must migrate.

Custom inputs use `FieldInputProps.inputId` on the real control; `path` remains the data pointer. Custom group renderers use `FieldRendererProps.labelId` on the title and `aria-labelledby` on the group. Options have distinct identifiers, radio inputs use the scoped `inputId` as their native `name`, and other inputs retain their leaf names.

Before:

```tsx
const Input = ({ path, name }: FieldInputProps<string>) => (
  <input id={path} name={name} />
);
```

After:

```tsx
const Input = ({ inputId, name }: FieldInputProps<string>) => (
  <input id={inputId} name={name} />
);
```

Replace `document.getElementById('/email')` with a selector scoped to the intended Form, such as `formElement.querySelector('[data-path="/email"] input')`, or retain the control's supplied `inputId` when connecting a label. Native radio submission keys are scoped; values returned by the Form API retain the schema shape.

Use `getInputId(key)` for additional elements instead of appending a suffix to `path` or `inputId`. The key is required; equal numeric and string keys refer to the same element. All identifiers are opaque and contain no whitespace. Inputs receive `labelId` directly for field-title associations, and renderers receive `inputId` and `labelId`.

Before:

```tsx
<input id={id + "-" + index} />
```

After:

```tsx
<input id={getInputId(index)} />
```
