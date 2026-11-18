---
"@canard/schema-form": patch
---

Refresh whole-array inputs after same-length external writes, including writes to individual items and automatic changes. Uncontrolled inputs remount with the new `defaultValue`; controlled inputs retain their DOM and receive the new `value`. Inputs that have rendered child fields preserve their child-owning container across Activity hiding. Before any child first renders, an external write can reset the parent input's local state.
