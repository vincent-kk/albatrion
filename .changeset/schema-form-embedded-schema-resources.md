---
"@canard/schema-form": patch
---

Resolve references inside embedded `$id` resources against that resource's base URI, following JSON Schema. Relative references may identify resources contained in the authored document; no external documents are fetched. Forms that previously resolved an embedded resource's fragment against the document root now use the resource's own schema, so their field types and defaults can change.
