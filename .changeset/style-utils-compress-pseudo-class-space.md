---
"@winglet/style-utils": patch
---

`compressCss` keeps the space before a pseudo-class or pseudo-element in a selector. Previously `.a :hover` (a hovered descendant of `.a`) was compressed to `.a:hover` (the hovered `.a` itself), changing which elements matched; the same happened to top-level pseudo-selectors injected through `styleManagerFactory`. Spaces before the colon of a declaration, as in `color : red`, are still removed.
