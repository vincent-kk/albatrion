---
"@winglet/style-utils": patch
---

Keep bare `:root` and `:host` selectors global across ASCII case variants, surrounding comments and CSS identifier escapes. Comments inside an identifier do not join separate tokens, and compound selectors still receive their scope prefix.
