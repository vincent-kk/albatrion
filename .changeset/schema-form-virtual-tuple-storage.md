---
"@canard/schema-form": patch
---

Keep virtual field tuples in declaration order when constituents are inactive, and resolve defaultValue, isDivergent, inactiveValues, writes and resets through the constituent storage addresses. Preserve inactive values on tuple write-back and make batched virtual Merge replace the same stored and retained paths as sequential calls.

A virtual group's defaultValue now reports the tuple of its constituents' defaults instead of undefined. Its divergence and inactive-value reads also project the constituents' own storage addresses, including a frozen default and inactive-value snapshot after detachment.

A batch now rejects a virtual tuple whose length becomes invalid between `setValue` and settlement. The other writes in the same settlement are also discarded.
