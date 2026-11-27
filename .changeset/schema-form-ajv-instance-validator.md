---
"@canard/schema-form-ajv6-plugin": minor
"@canard/schema-form-ajv7-plugin": minor
"@canard/schema-form-ajv8-plugin": minor
---

Add `createValidator(instance)` to create an isolated validator binding for a form. Each returned validator owns its schema registrations and guard lifetime, so forms can use different AJV profiles without replacing the plugin-wide `bind` selection. The existing shared plugin binding remains available. AJV8 exposes this factory from its default, 2019 and 2020 dialect entries.
