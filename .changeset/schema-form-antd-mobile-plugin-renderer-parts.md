---
"@canard/schema-form-antd-mobile-plugin": major
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

`LabelRenderer` and `ErrorMessageRenderer` render their own root and accept `LabelRendererProps` and `ErrorMessageRendererProps`, so `Form.Label`, `Form.ErrorMessage` and the parts given to a custom `FieldRenderer` use the plugin's markup. A label's `for` points at its control's Form-scoped id, and the required asterisk is hidden from assistive technology. A shown error message is wrapped in a `span`. A null, undefined or boolean message adds no `Space` item; for a leaf field an empty string still adds one with an empty `span`; for a nested group or the root an empty string adds none.

Nested objects and arrays, including checkbox groups and range sliders, keep the 0.x layout with no visible title or required marker; a hidden title element carries the field's `labelId`, so array, checkbox and slider groups keep their accessible name. Validation messages for these nested groups and for the root form are now shown below the input.
