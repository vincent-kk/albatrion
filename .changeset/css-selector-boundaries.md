---
"@winglet/style-utils": patch
---

Scoped styles retain empty selector-list members instead of turning them into a selector for the scope container. ASCII case variants and trailing comments on :root and :host keep the same global-selector behavior.
