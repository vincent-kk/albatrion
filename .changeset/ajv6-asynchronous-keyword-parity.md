---
"@canard/schema-form-ajv6-plugin": patch
---

Validate asynchronous custom keywords consistently with and without a root `$id`, even when the schema does not explicitly declare `$async: true`. Synchronous schemas retain synchronous AJV compilation and error handling, while asynchronous failures return normalized issues with the original rejected-key routing.
