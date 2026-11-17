---
"@winglet/style-utils": patch
---

`styleManagerFactory` no longer loses rules when a brace, semicolon or comma appears inside a quoted string, a comment or a backslash escape. Previously `.a::before { content: "}" } .b { color: blue }` was injected as `.card .a::before{content:"}.card .b{color:blue}`, with the scope written into the string, `@import url("a;b.css");` was split at the inner semicolon, and an unmatched brace in a string dropped the rest of the sheet. Comments between rules no longer hide the at-rule that follows them, a stray `}` is dropped instead of breaking the next selector, and a `/*` inside an unquoted `url(…)` no longer opens a comment. A brace inside an unquoted `url(…)` is still read as structure; quote such URLs.
