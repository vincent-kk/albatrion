---
"@winglet/style-utils": patch
---

`styleManagerFactory` now keeps `@media` blocks intact when it scopes CSS. Previously the block lost its closing brace, so every rule after it fell inside the media query, and the rules inside it were injected without the scope prefix. Rules inside `@media`, `@supports`, `@container`, `@layer`, `@document` and `@starting-style` are now prefixed like top-level rules, while `@keyframes`, `@font-face`, `@page` and statement at-rules such as `@import` are copied unchanged.
