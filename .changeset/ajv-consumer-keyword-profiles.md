---
"@canard/schema-form-ajv6-plugin": patch
"@canard/schema-form-ajv7-plugin": patch
"@canard/schema-form-ajv8-plugin": patch
---

Compile with current application formats, keywords, options, and reference registrations. Edits to schemas registered with `addSchema` apply to new compiles. A registration key and an ID can select different schemas, and a removed embedded ID is unavailable to new compiles. Existing validators and guards keep their compiled rules.
