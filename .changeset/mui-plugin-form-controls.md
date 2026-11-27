---
"@canard/schema-form-mui-plugin": major
---

Breaking change: the plugin requires `@canard/schema-form` 1.x; reads the slider's `lazy`, the URI input's `protocols` and the date picker's `minimum` and `maximum` only from `presentation.FieldInputProps`; stores the slider's value on pointer release by default; and gives controls Form-scoped ids and radio group names instead of the field path and name.

Install the core release that this plugin declares as a peer dependency:

```sh
yarn add @canard/schema-form@^1.0.0 @canard/schema-form-mui-plugin@^1.0.0
```

In 0.x the slider stored every value during pointer movement unless the schema set `lazy: true`. It now stores on pointer release, and keyboard movement still stores on each key press. The schema-level `lazy` key is ignored; to keep updates during pointer movement, set `presentation.FieldInputProps.lazy` to `false`:

```ts
// Before
const before = { type: 'number', formType: 'slider' };

// After
const after = {
  type: 'number',
  presentation: { inputType: 'slider', FieldInputProps: { lazy: false } },
};
```

The URI input no longer reads `protocols` from the schema's `options`, and the date picker no longer applies `minimum` and `maximum` written on the schema itself, because the form passes the input a schema without string values of those two keywords. Both settings are ignored without a warning; move them to `presentation.FieldInputProps`:

```ts
// Before
const before = {
  type: 'object',
  properties: {
    link: { type: 'string', format: 'uri', options: { protocols: ['https'] } },
    start: { type: 'string', format: 'date', minimum: '2024-03-01' },
  },
};

// After
const after = {
  type: 'object',
  properties: {
    link: {
      type: 'string',
      format: 'uri',
      presentation: { FieldInputProps: { protocols: ['https'] } },
    },
    start: {
      type: 'string',
      format: 'date',
      presentation: { FieldInputProps: { minimum: '2024-03-01' } },
    },
  },
};
```

Each control's `id`, the `for` of its label, and a radio group's native `name` use identifiers scoped to the Form instead of the JSON Pointer path and the field name. An enum Select gives its trigger, hidden native input and popup menu separate scoped ids, so Forms that share a field name no longer share them. Code that looks up a control by its path, such as `document.getElementById('/age')`, no longer finds it; reach the field through the form handle, for example `formRef.current.focus('/age')`. Native `FormData` receives a radio choice under the scoped name; read values with `formRef.current.getValue()`.
