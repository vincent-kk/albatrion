---
'@canard/schema-form': patch
---

`useChildFieldMap` renders nothing for every missing child, including names such as `constructor` and `toString`, so an optional child cannot replace its siblings with an error fallback.
