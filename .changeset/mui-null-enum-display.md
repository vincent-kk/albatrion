---
"@canard/schema-form-mui-plugin": patch
---

Show an empty select when a nullable enum holds `null` and has no null option, avoiding MUI out-of-range warnings. An explicit null option remains distinct from the string `"null"`.
