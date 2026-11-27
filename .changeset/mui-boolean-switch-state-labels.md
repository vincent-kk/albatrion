---
"@canard/schema-form-mui-plugin": minor
---

Boolean switches accept `presentation.FieldInputProps.alias` with optional `checked` and `unchecked` ReactNode labels. `context.checkboxLabels` takes priority over `alias`. The current state label appears next to the switch while the field keeps its accessible name; switches without state labels keep their existing markup.
