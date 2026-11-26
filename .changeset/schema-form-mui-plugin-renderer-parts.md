---
"@canard/schema-form-mui-plugin": major
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

`LabelRenderer` and `ErrorMessageRenderer` render their own root and accept `LabelRendererProps` and `ErrorMessageRendererProps`, so `Form.Label`, `Form.ErrorMessage` and the parts given to a custom `FieldRenderer` use the plugin's markup. A label's `for` points at its control's Form-scoped id. The group still draws no label; use `Form.Label` when arranging a standalone label.
