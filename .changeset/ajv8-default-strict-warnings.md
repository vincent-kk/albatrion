---
"@canard/schema-form-ajv8-plugin": patch
---

Disable strict checking by default in the default, 2019 and 2020 validator entries, matching the documented settings. Compiling conditional fields and open tuples no longer emits strict-mode warnings; options supplied through `bind` still take effect.
