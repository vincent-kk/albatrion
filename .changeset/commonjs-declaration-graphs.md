---
"@winglet/common-utils": patch
"@winglet/data-loader": patch
"@winglet/json": patch
"@winglet/json-schema": patch
"@winglet/react-utils": patch
"@winglet/style-utils": patch
"@canard/schema-form": patch
"@canard/schema-form-ajv6-plugin": patch
"@canard/schema-form-ajv7-plugin": patch
"@canard/schema-form-ajv8-plugin": patch
"@canard/schema-form-antd-mobile-plugin": patch
"@canard/schema-form-antd5-plugin": patch
"@canard/schema-form-antd6-plugin": patch
"@canard/schema-form-mui-plugin": patch
"@lerx/promise-modal": patch
---

Fix CommonJS TypeScript imports under Node16 and NodeNext by providing matching CommonJS declarations for every public entry point. Published export maps resolve built files even when consumers enable the source condition.
