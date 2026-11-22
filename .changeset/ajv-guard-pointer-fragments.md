---
"@canard/schema-form-ajv6-plugin": patch
"@canard/schema-form-ajv7-plugin": patch
"@canard/schema-form-ajv8-plugin": patch
---

Select the authored condition with `compileGuard` when a JSON Pointer contains a literal percent in a property name. For example, `/properties/a%20b/if` selects the property named `a%20b`. AJV 8 also accepts URI fragments with encoded separators, such as `#%2Fproperties%2Ffield%2Fif`. Encode a literal percent as `%25` in a URI fragment. AJV 7 and 8 use only declared dynamic anchors.
