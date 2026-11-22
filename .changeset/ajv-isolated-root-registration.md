---
"@canard/schema-form-ajv6-plugin": patch
"@canard/schema-form-ajv7-plugin": patch
"@canard/schema-form-ajv8-plugin": patch
---

Compile form roots in a private AJV instance so their addresses and release cannot overwrite or remove application schemas. For an address that must be visible to application code or another root, register the schema with the application's AJV instance. Each new compile sees current application formats, keywords, options, and reference registrations. A registration key and an ID can point to different schemas, and a removed embedded ID is unavailable to new compiles. Existing validators and guards keep their compiled rules. The plugins enable asynchronous validation on their root copies when needed while application-owned synchronous references retain their native behavior.
