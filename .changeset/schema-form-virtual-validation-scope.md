---
'@canard/schema-form': patch
---

Calling `validate()` on a virtual group refreshes displayed errors on the fields it groups, while leaving unrelated fields' displayed errors unchanged.
