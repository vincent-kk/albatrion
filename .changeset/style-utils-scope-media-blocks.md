---
"@winglet/style-utils": major
---

Breaking change: `styleManagerFactory` now scopes the first rule inside `@media` and the other grouping at-rules, and a rule that follows a statement at-rule such as `@import` in the same sheet, so those rules no longer apply to elements outside the scope. A page that relied on them applying to the whole document must add the scope class to an ancestor of those elements, or inject those rules through a separate unscoped stylesheet.

Before, only the first rule inside a grouping block was left unscoped, later rules in the block were already scoped, and the block lost its closing brace, so every rule after it fell inside the media query. A rule written after a statement at-rule was copied unscoped together with the statement.

```ts
const addStyle = styleManagerFactory("card");
addStyle(
  "m",
  "@media (max-width: 600px) { .title { color: red } } .body { color: blue }",
);
// before: '@media (max-width:600px){.title{color:red}.card .body{color:blue}'
// after:  '@media (max-width:600px){.card .title{color:red}}.card .body{color:blue}'
```

Rules inside `@media`, `@supports`, `@container`, `@layer`, `@scope`, `@document` and `@starting-style` are prefixed like top-level rules, while `@keyframes`, `@font-face`, `@page` and statement at-rules such as `@import` are copied unchanged, including a sheet that holds only statements.
