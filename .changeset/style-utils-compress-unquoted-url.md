---
"@winglet/style-utils": patch
---

`compressCss` copies an unquoted `url(…)` unchanged. Previously `background: url(http://x.com/a/*b)` was read as the start of a comment, and the rest of the stylesheet was dropped. It also keeps the space before a pseudo-class when a comment holding `}` or `;` follows the selector: `.a :hover /* } */ { color: red }` previously became `.a:hover`, which matches the hovered `.a` itself instead of its hovered descendants.
