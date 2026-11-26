---
"@canard/schema-form-antd-mobile-plugin": major
---

Breaking change: the plugin requires `@canard/schema-form` 1.x, the slider reads `lazy` and `marks` from `presentation.FieldInputProps` instead of the schema's `options`, and the text, textarea and checkbox controls use Form-scoped ids instead of the field path.

Install the core release that this plugin declares as a peer dependency:

```sh
yarn add @canard/schema-form@^1.0.0 @canard/schema-form-antd-mobile-plugin@^1.0.0
```

A slider setting left under `options` is ignored without a warning. The slider's `range` setting is replaced by the schema type, as the slider shape entry describes.

Before:

```ts
const schema = {
  type: 'number',
  format: 'slider',
  options: { lazy: false, marks: { 0: 'Low', 100: 'High' } },
};
```

After:

```ts
const schema = {
  type: 'number',
  format: 'slider',
  presentation: { FieldInputProps: { lazy: false, marks: { 0: 'Low', 100: 'High' } } },
};
```

The `id` of text, textarea and checkbox controls, and the `for` of their labels, use an identifier scoped to the Form instead of the JSON Pointer path. Code that looks up a control by its path, such as `document.getElementById('/memo')`, no longer finds it; reach the field through the form handle, for example `formRef.current.focus('/memo')`. Sliders, steppers, radio groups and checkbox groups carry the scoped id on a group element around the control.
