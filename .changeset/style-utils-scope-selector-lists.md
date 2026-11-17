---
"@winglet/style-utils": patch
---

`styleManagerFactory` now scopes every selector in a selector list. Previously `.a, .b { … }` was injected as `.scope .a,.b{…}`, so `.b` applied to the whole document. The list is split only at top-level commas, so `:is(.a, .b)` stays one selector, and a selector that is exactly `:root` or `:host` still stays unprefixed.
