---
"@canard/schema-form-mui-plugin": patch
---

The date and month pickers now honor `presentation.FieldInputProps.minimum` and `maximum` (`YYYY-MM-DD` for dates, `YYYY-MM` for months) and disable choices outside that range. Before, the date picker looked for the limits on the string schema, where the form never passes them, and the month picker ignored limits entirely, so neither picker restricted the selection. Limits are parsed strictly: a limit that is not a real date or month in that form, such as `2024-02-31` or `2024-13`, is ignored instead of being rolled over to a different day or month.

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
