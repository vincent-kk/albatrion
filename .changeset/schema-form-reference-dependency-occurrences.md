---
"@canard/schema-form": patch
---

Track `controls.derived`, state controls and watched dependencies separately for every reused or recursive `$ref` occurrence. Changes now reach later hosts after array movement, branch exit and re-entry, reset, or context replacement, while ordinary schemas keep their existing dependency path.
