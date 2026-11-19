---
"@canard/schema-form": patch
---

Keep virtual field tuples in declaration order when constituents are inactive, and resolve defaultValue, isDivergent, inactiveValues, writes and resets through the constituent storage addresses. Preserve inactive values on tuple write-back and make batched virtual Merge replace the same stored and retained paths as sequential calls.
