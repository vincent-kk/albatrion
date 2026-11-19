---
"@canard/schema-form-ajv7-plugin": patch
---

Preserve application-owned schema registrations when a form releases its validation resources. A schema registered before the form, or re-registered under the same `$id` while the form is active, remains available to the application.
