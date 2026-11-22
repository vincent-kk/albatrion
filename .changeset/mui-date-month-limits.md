---
"@canard/schema-form-mui-plugin": patch
---

The date and month pickers now honor `presentation.FieldInputProps.minimum` and `maximum` (`YYYY-MM-DD` for dates, `YYYY-MM` for months) and disable choices outside that range. For date fields, a missing presentation limit falls back to the matching schema property. Month fields use presentation limits. Limits are parsed strictly: a limit that is not a real date or month in that form, such as `2024-02-31` or `2024-13`, is ignored instead of being rolled over to a different day or month.

```ts
{
  type: 'string',
  format: 'date',
  presentation: { FieldInputProps: { minimum: '2024-03-01', maximum: '2024-06-30' } },
}
```
