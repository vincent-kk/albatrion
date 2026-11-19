---
"@canard/schema-form-mui-plugin": minor
---

String switches accept `presentation.FieldInputProps.alias` maps keyed by the stored enum value. `context.switchLabels` takes priority over the alias map, and either map takes priority over the MUI-only schema `switchLabels` tuple. A missing map key displays the enum value; without a map, existing tuple labels keep working.
