---
"@canard/schema-form-ajv7-plugin": patch
"@canard/schema-form-ajv8-plugin": patch
---

Resolve dynamic references in synchronous guards using declared anchors. Root-pointer guards bind declared chain-resource names such as `toString` as own entries. An undeclared name or schema-like data inside `const` does not bind.
