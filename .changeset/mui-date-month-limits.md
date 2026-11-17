---
"@canard/schema-form-mui-plugin": patch
---

The date and month pickers now honor `presentation.FieldInputProps.minimum` and `maximum` (`YYYY-MM-DD` for dates, `YYYY-MM` for months) and disable choices outside that range. Before, the date picker looked for the limits on the string schema, where the form never passes them, and the month picker ignored limits entirely, so neither picker restricted the selection.

```ts
// Before: no effect
{ type: 'string', format: 'date', minimum: '2024-03-01' }

// After
{
  type: 'string',
  format: 'date',
  presentation: { FieldInputProps: { minimum: '2024-03-01', maximum: '2024-06-30' } },
}
```
