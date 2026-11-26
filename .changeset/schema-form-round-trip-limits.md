---
"@canard/schema-form": patch
---

The packaged arrays knowledge file now states that saving `getValue()` and loading it again does not bring back what `omitTrailingEmpty` and `omitEmpty` left out of the output: trimmed trailing items do not return as rows, and a field whose `''` was dropped loads with `node.value` `undefined`, or with its `default` when it has one. Apart from such a default, the output itself is the same.
