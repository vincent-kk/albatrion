---
"@winglet/style-utils": minor
---

Allow `destroyScope(scopeId, { shadowRoot })` to release the Shadow DOM scope created by `styleManagerFactory`. Document scopes and other shadow roots remain independent. Detached shadow hosts can be garbage-collected when application references are released.
