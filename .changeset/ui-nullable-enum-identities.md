---
"@canard/schema-form-antd5-plugin": patch
"@canard/schema-form-antd6-plugin": patch
"@canard/schema-form-antd-mobile-plugin": patch
"@canard/schema-form-mui-plugin": patch
---

Distinguish `null` from the string `"null"` in enum selects, radio groups and checkbox groups. Initial selections and emitted values retain the raw scalar type, and multiple selections can include both values independently. Display labels and aliases remain unchanged.
