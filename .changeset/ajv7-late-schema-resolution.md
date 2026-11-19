---
"@canard/schema-form-ajv7-plugin": patch
---

Resolve schemas added to the application AJV instance after a form or compiler pool was created. Later validation and guard compiles can use those registrations without replacing isolated compiler caches; already compiled schemas retain their original behavior.

This also preserves asynchronous keywords and boolean definitions resolved through application registration aliases.
