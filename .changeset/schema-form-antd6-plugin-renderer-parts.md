---
"@canard/schema-form-antd6-plugin": minor
---

Breaking change: the plugin supplies `LabelRenderer` and `ErrorMessageRenderer` for the renderer-parts API and no longer supplies a pass-through input frame. Upgrade it together with the matching `@canard/schema-form` API, and rename explicitly wired slot props.

Before:

```tsx
<Form
  FormLabelRenderer={plugin.FormLabelRenderer}
  FormErrorRenderer={plugin.FormErrorRenderer}
  FormInputRenderer={plugin.FormInputRenderer}
  jsonSchema={schema}
/>
```

After:

```tsx
<Form
  LabelRenderer={plugin.LabelRenderer}
  ErrorMessageRenderer={plugin.ErrorMessageRenderer}
  jsonSchema={schema}
/>
```

The label and error renderers own their roots and accept their dedicated part props; custom groups reuse the bound Label and ErrorMessage. Required marks are aria-hidden. Existing group layout and array-item label omission are preserved.
