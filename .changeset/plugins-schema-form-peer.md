---
"@canard/schema-form-ajv6-plugin": major
"@canard/schema-form-ajv7-plugin": major
"@canard/schema-form-ajv8-plugin": major
---

Breaking change: the AJV plugins declare `@canard/schema-form` 1.x as a peer dependency, which 0.x did not declare. Install a 1.x release of `@canard/schema-form` with the plugin; a project that keeps `@canard/schema-form` 0.x gets an unmet peer dependency.

```sh
yarn add @canard/schema-form@^1.0.0 @canard/schema-form-ajv8-plugin@^1.0.0
```
