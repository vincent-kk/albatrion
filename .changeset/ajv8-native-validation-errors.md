---
"@canard/schema-form-ajv8-plugin": patch
---

Preserve exceptions thrown by custom keywords unless they are the bound AJV instance's native `ValidationError`. Errors with an `errors` property and non-error thrown values now reach the caller unchanged instead of becoming validation issues.
