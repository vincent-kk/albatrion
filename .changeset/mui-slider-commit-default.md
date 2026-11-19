---
"@canard/schema-form-mui-plugin": major
---

Breaking change: sliders with omitted `presentation.FieldInputProps.lazy` store on commit instead of on every move. Keyboard selection commits on key up and pointer selection on release; `lazy: false` keeps immediate updates. A first committed minimum selection still stores an unset value.

Before (immediate updates):

```tsx
<Form jsonSchema={{ type: 'number', presentation: { inputType: 'slider' } }} />
```

After (keep immediate updates explicitly):

```tsx
<Form jsonSchema={{ type: 'number', presentation: { inputType: 'slider', FieldInputProps: { lazy: false } } }} />
```

Leave `lazy` omitted to store only committed selections.
