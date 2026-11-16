---
"@canard/schema-form": major
---

Breaking change: the Form props, the FormProvider props, the plugin keys and the layout component that carried the 0.x "form type" and "group" vocabulary are renamed. The old spellings are not read, so a prop or plugin key left unrenamed is silently ignored.

| 0.x | 1.0.0 |
| --- | --- |
| `formTypeInputDefinitions` (Form prop, plugin key) | `fieldInputDefinitions` |
| `formTypeInputMap` (Form prop) | `fieldInputMap` |
| `CustomFormTypeRenderer` (Form prop) | `FieldRenderer` |
| `FormProviderProps.FormGroupRenderer` | `FormProviderProps.FieldRenderer` |
| `FormProviderProps.FormLabelRenderer` | `FormProviderProps.LabelRenderer` |
| `FormProviderProps.FormInputRenderer` | `FormProviderProps.InputRenderer` |
| `FormProviderProps.FormErrorRenderer` | `FormProviderProps.ErrorMessageRenderer` |
| plugin `FormGroup` | plugin `FieldRenderer` |
| plugin `FormLabel` | plugin `LabelRenderer` |
| plugin `FormInput` | plugin `InputRenderer` |
| plugin `FormError` | plugin `ErrorMessageRenderer` |
| `Form.Group` | `Form.Field` |
| `FormGroupProps` | `FormFieldProps` |
| `FormTypeRendererProps` | `FieldRendererProps` |
| `FormTypeInputProps.ChildNodeComponents` | `FieldInputProps.ChildFields` |

Before:

```tsx
registerPlugin({ FormGroup: Group, formTypeInputDefinitions: definitions });

<Form
  jsonSchema={jsonSchema}
  formTypeInputMap={inputMap}
  CustomFormTypeRenderer={Renderer}
>
  <Form.Group path="/name" />
</Form>;
```

After:

```tsx
registerPlugin({ FieldRenderer: Group, fieldInputDefinitions: definitions });

<Form
  jsonSchema={jsonSchema}
  fieldInputMap={inputMap}
  FieldRenderer={Renderer}
>
  <Form.Field path="/name" />
</Form>;
```

The label, input and error renderers also receive new props types; the entry on `LabelRenderer`, `InputRenderer` and `ErrorMessageRenderer` describes them.
