---
"@winglet/common-utils": patch
---

Clarify that `clone` preserves built-in state and prototypes of Map, Set, Date, RegExp and Array subclasses but does not copy their additional own fields or initialize private fields. Runtime behavior is unchanged.
