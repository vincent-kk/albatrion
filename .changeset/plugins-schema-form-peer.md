---
"@canard/schema-form-antd5-plugin": patch
"@canard/schema-form-antd6-plugin": patch
"@canard/schema-form-antd-mobile-plugin": patch
"@canard/schema-form-mui-plugin": patch
"@canard/schema-form-ajv6-plugin": patch
"@canard/schema-form-ajv7-plugin": patch
"@canard/schema-form-ajv8-plugin": patch
---

Declare `@canard/schema-form` as a peer dependency so package installers check that the host form library is present. Install the matching core release alongside each UI or AJV plugin.
