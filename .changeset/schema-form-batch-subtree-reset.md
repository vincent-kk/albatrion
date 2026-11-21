---
"@canard/schema-form": patch
---

A resetSubtree inside batch now survives an earlier write to an ancestor. Pending ancestor writes settle before the subtree reload, preserving their changes outside the reset scope while ensuring the batch end cannot restore the subtree’s pre-reset value.
