---
"@canard/schema-form": patch
---

Show initial `errors` in server-rendered HTML and the first client render. Applying initial server errors no longer requires a second render, and preserves the existing `onValidate` and `onChange` callback counts.
