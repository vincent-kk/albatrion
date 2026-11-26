---
"@canard/schema-form-antd5-plugin": major
---

Breaking change: the plugin requires `@canard/schema-form` 1.x, reads its per-input settings from `presentation.FieldInputProps` instead of the schema's `options`, and gives its controls Form-scoped ids and radio group names instead of the field path and name.

Install the core release that this plugin declares as a peer dependency:

```sh
yarn add @canard/schema-form@^1.0.0 @canard/schema-form-antd5-plugin@^1.0.0
```

Move these settings from `options` to `presentation.FieldInputProps`: the slider's `lazy`, the `minimum` and `maximum` of the date, month, date range, month range and time range pickers, and the URI input's `protocols`. A setting left under `options` is ignored without a warning.

Before:

```ts
const schema = {
  type: 'number',
  formType: 'slider',
  options: { lazy: false },
};
```

After:

```ts
const schema = {
  type: 'number',
  presentation: { inputType: 'slider', FieldInputProps: { lazy: false } },
};
```

Each control's `id`, and the `for` of its label, use an identifier scoped to its Form instead of the JSON Pointer path, and a radio group's native `name` uses that identifier instead of the field name. Code that looks up a control by its path, such as `document.getElementById('/age')`, no longer finds it; reach the field through the form handle, for example `formRef.current.focus('/age')`. Native `FormData` receives a radio choice under the scoped name; read values with `formRef.current.getValue()`. With Ant Design 5.14 or later, a range picker's start and end inputs receive separate ids; earlier 5.x releases give the range picker one id.
