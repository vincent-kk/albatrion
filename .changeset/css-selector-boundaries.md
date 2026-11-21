---
"@winglet/style-utils": patch
---

Scoped styles retain empty selector-list members instead of turning them into a selector for the scope container. Invalid empty members stay invalid when styles are scoped.
