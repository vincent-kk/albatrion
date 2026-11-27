---
"@winglet/style-utils": patch
---

`compressCss` keeps the spaces around `+` inside parentheses. Previously `calc(1px + 2px)` became `calc(1px+2px)`, which browsers reject, so the whole declaration was dropped. Outside parentheses `+` is still treated as the sibling combinator and its spaces are removed.
