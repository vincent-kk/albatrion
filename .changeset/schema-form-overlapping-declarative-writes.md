---
"@canard/schema-form": patch
---

When two `controls.injectTo` or `controls.derived` rules write overlapping fields in one update (one writes an object, the other a field inside it), the rule that wins on a shared target now also wins on the overlap. Each write completes before the next overlapping one is applied, and the next one is compared with the value the earlier write left, so a value one rule names for an inactive field is not lost and a higher-ranked value equal to the starting value still replaces the lower rule's write. Before, the result depended on internal evaluation order. Rules whose targets do not overlap are applied together as before.
