---
"@canard/schema-form-ajv7-plugin": patch
---

Compile schemas that use asynchronous keywords or formats consistently through `createValidator`, `createValidatorFactory` and the plugin validator. Named and anonymous roots, referenced schemas and repeated compilation share the same asynchronous validation behavior without depending on AJV error messages or inlining. Ordinary synchronous schemas retain synchronous native compilation.
