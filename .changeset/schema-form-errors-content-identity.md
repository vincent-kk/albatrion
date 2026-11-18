---
"@canard/schema-form": patch
---

Keep server errors cleared after user edits when a parent passes an `errors` array with unchanged content. Only a content change now reapplies external errors.
