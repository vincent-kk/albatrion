---
"@winglet/style-utils": major
---

**Breaking:** `styleManagerFactory` now scopes every selector in a selector list, so selectors after the first one no longer apply to elements outside the scope. A page that relied on them applying to the whole document must add the scope class to an ancestor of those elements, or inject those rules through a separate unscoped stylesheet:

```ts
const addStyle = styleManagerFactory("card");
addStyle("l", ".title, .subtitle { color: red }");
// before: '.card .title,.subtitle{color:red}'
// after:  '.card .title,.card .subtitle{color:red}'
```

The list is split only at top-level commas, so `:is(.a, .b)` stays one selector, and a selector that is exactly `:root` or `:host` still stays unprefixed.
