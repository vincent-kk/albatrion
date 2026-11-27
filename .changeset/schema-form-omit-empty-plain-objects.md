---
"@canard/schema-form": patch
---

`omitEmpty` no longer drops a field whose value is a `Date`, `File` or other non-plain object without own keys. Only an empty string, an empty array and an empty plain object (`{}` or `Object.create(null)`) count as empty, so an object field or a custom input that stores such a value now keeps it in the submitted output.
