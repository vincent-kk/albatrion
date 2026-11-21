---
"@canard/schema-form-ajv6-plugin": patch
"@canard/schema-form-ajv7-plugin": patch
"@canard/schema-form-ajv8-plugin": patch
---

Compile form roots in a private AJV instance so their addresses and release cannot overwrite or remove application schemas. For an address that must be visible to application code or another root, register the schema with the application's AJV instance. Each new compile sees current application formats, keywords, options, and references. AJV 6 and 8 enable asynchronous validation on the plugin's root copy while application-owned synchronous references retain their native behavior.
