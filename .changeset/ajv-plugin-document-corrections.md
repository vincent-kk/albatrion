---
"@canard/schema-form-ajv6-plugin": patch
"@canard/schema-form-ajv7-plugin": patch
"@canard/schema-form-ajv8-plugin": patch
---

The READMEs no longer describe form roots as registered on your AJV instance: releasing a root frees only the plugin's own compiled results, and a compiled validator is reused while the root and the instance's options, formats, keywords and registered schemas are unchanged. The AJV 8 README states that 1.0.0 refuses instances that modify values and that a custom AJV subclass must not register schemas in its constructor. The Korean READMEs gain the paragraphs they lacked.

`@canard/schema-form-ajv8-plugin`: The advanced-usage example in the README now passes `strict: false`, without which AJV 8 rejects schemas that carry form-only keywords.
