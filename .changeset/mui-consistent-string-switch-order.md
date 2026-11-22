---
"@canard/schema-form-mui-plugin": major
---

Breaking change: string switches now use `enum[0]` for the checked value and `enum[1]` for the unchecked value, consistently with the other UI plugins.

Before, `enum: ['off', 'on']` stored `'on'` when checked. After, use `enum: ['on', 'off']` to keep that behavior. `switchLabels` follows the same checked, unchecked order:

```ts
// Before
{ type: 'string', enum: ['off', 'on'], switchLabels: ['Off', 'On'] }
// After
{ type: 'string', enum: ['on', 'off'], switchLabels: ['On', 'Off'] }
```
