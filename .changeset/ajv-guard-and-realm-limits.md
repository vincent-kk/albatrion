---
"@canard/schema-form-ajv6-plugin": patch
"@canard/schema-form-ajv7-plugin": patch
"@canard/schema-form-ajv8-plugin": patch
---

The READMEs now document two limits: a guard compiles synchronously, so an asynchronous format that `$data` selects at run time is not detected when the guard compiles, and an AJV instance with the validators built from it must stay within one JavaScript realm, so sharing one instance across worker threads is not supported.

Check these limits before you depend on `$data`-selected asynchronous formats in a guard or hand one AJV instance to several worker threads.
