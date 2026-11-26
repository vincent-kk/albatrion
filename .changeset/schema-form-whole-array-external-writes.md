---
"@canard/schema-form": patch
---

Refresh whole-array inputs after same-length external writes, including writes to individual items and automatic changes. Uncontrolled inputs remount with the new `defaultValue`; controlled inputs retain their DOM and receive the new `value`. Inputs that have rendered child fields preserve their child-owning container across Activity hiding. Before any child first renders, an external write can reset the parent input's local state.

When an `InputRenderer` frame swaps the element around its children, for example through its own state, the bound input remounts from the current value. If the remounted input draws no child fields, later external writes remount it with the new `defaultValue`, the same as after a change of input component or `InputRenderer` type. Child fields that it does draw keep their DOM state across external writes; until they first render, an external write can reset its local state as described above.
