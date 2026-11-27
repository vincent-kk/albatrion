---
"@canard/schema-form-antd5-plugin": major
---

Breaking change: the exported `plugin` object uses the `@canard/schema-form` 1.0 slot names. `FormGroup` is now `FieldRenderer`, `FormLabel` is now `LabelRenderer`, `FormError` is now `ErrorMessageRenderer`, `formTypeInputDefinitions` is now `fieldInputDefinitions`, and the pass-through `FormInput` is removed.

`registerPlugin(plugin)` needs no change. Rename the parts where you wire them explicitly:

Before:

```tsx
<FormProvider
  FormGroupRenderer={plugin.FormGroup}
  FormLabelRenderer={plugin.FormLabel}
  FormInputRenderer={plugin.FormInput}
  FormErrorRenderer={plugin.FormError}
  formTypeInputDefinitions={plugin.formTypeInputDefinitions}
>
  {children}
</FormProvider>
```

After:

```tsx
<FormProvider
  FieldRenderer={plugin.FieldRenderer}
  LabelRenderer={plugin.LabelRenderer}
  ErrorMessageRenderer={plugin.ErrorMessageRenderer}
  fieldInputDefinitions={plugin.fieldInputDefinitions}
>
  {children}
</FormProvider>
```

`LabelRenderer` and `ErrorMessageRenderer` render their own root and accept `LabelRendererProps` and `ErrorMessageRendererProps`, so `Form.Label`, `Form.ErrorMessage` and the `Label` and `ErrorMessage` parts given to a custom `FieldRenderer` use the plugin's markup. A label's `for` points at its control's Form-scoped id, a nested group's legend carries the field title id, and the required asterisk is hidden from assistive technology. Apart from the validation messages that their own entry describes, group layout and the omission of labels for direct array items are unchanged.
