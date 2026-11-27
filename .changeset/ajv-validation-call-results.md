---
"@canard/schema-form-ajv6-plugin": patch
"@canard/schema-form-ajv7-plugin": patch
"@canard/schema-form-ajv8-plugin": patch
---

Keep validation issues tied to the call that produced them and pass through execution exceptions. Successful asynchronous validation resolves to `null` for falsy data.

AJV 8 converts errors from the selected AJV constructor's `ValidationError` class to issues. An exception from application code keeps its identity, including a `ValidationError` from another AJV copy.
