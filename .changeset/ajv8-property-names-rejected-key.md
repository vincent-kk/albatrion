---
"@canard/schema-form-ajv8-plugin": patch
---

Every issue a `propertyNames` failure produces now carries the offending key as `rejectedKey`, including the inner keyword's issue (for example `pattern`), matching the AJV 6 and AJV 7 plugins. A `propertyNames: false` issue keeps the object's `dataPath` instead of moving to its parent.
