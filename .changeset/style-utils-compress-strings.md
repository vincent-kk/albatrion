---
"@winglet/style-utils": patch
---

`compressCss` no longer treats `/*` inside a quoted string as the start of a comment. Previously `.a{content:"/*"}.b{color:red}` was cut to `.a{content:"`, silently dropping the rest of the stylesheet; quoted strings are now copied unchanged. `styleManagerFactory` compresses CSS with the same function, so injected styles benefit too.
