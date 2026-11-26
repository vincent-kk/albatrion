---
"@canard/schema-form": major
---

Breaking change: the Form props, the FormProvider props, the plugin keys and the layout components that carried the 0.x "form type" and "group" vocabulary are renamed. The old spellings are not read, so a prop or plugin key left unrenamed is silently ignored.

| 0.x | 1.0.0 |
| --- | --- |
| `formTypeInputDefinitions` (Form prop, FormProvider prop, plugin key) | `fieldInputDefinitions` |
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
| `FormTypeInput` (prop of `Form.Group`, `Form.Input` and `Form.Render`) | `FieldInput` |
| `FormTypeRenderer` (prop of `Form.Group` and of each child component) | `FieldRenderer` |
| `FormTypeRendererProps` | `FieldRendererProps` |
| `FormTypeInputProps.ChildNodeComponents` | `FieldInputProps.ChildFields` |

`Form.Field`, `Form.Input`, `Form.Render` and child components accept extra props for the input, so TypeScript does not report a leftover `FormTypeInput` or `FormTypeRenderer` prop on them; search your code for both names.

Before:

```tsx
registerPlugin({ FormGroup: Group, formTypeInputDefinitions: definitions });

<Form
  jsonSchema={jsonSchema}
  formTypeInputMap={inputMap}
  CustomFormTypeRenderer={Renderer}
>
  <Form.Group path="/name" FormTypeInput={NameInput} />
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
  <Form.Field path="/name" FieldInput={NameInput} />
</Form>;
```

The label, input and error renderers also receive new props types; the entry on `LabelRenderer`, `InputRenderer` and `ErrorMessageRenderer` describes them.
