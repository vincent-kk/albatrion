---
"@canard/schema-form": patch
---

Turning off a virtual group with `controls.active` no longer removes the interaction state (such as `touched`) of its fields from the form-wide `globalState`. Before, a later state change on such a field could throw `Negative global state count`.
