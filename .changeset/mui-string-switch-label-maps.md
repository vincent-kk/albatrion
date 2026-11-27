---
"@canard/schema-form-mui-plugin": minor
---

String switches take their state labels from `context.switchLabels` or `presentation.FieldInputProps.alias`, both keyed by the stored enum value; `context.switchLabels` takes precedence, and a value missing from the chosen map shows the value itself. The schema's `switchLabels` tuple applies only when neither map is supplied.
