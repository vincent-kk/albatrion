---
'@canard/schema-form': patch
---

`ALL_OF_KEYWORD_IGNORED_FOR_FORM` is reported for unsupported keywords in an `allOf` reference just as it is for the equivalent inline schema. Referenced `not`, `contains`, `dependentRequired`, and `unevaluatedProperties` declarations no longer silently lose their advisory warning.
