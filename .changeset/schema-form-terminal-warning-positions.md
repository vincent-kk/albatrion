---
"@canard/schema-form": patch
---

Report `TerminalSubtreeKeyIgnoredForForm` for `controls`, `options` and `presentation` written under `propertyNames`, `contentSchema` or `dependencies` inside a terminal field. These form-only declarations were already ignored and removed from validator schemas, but no warning told you so.
