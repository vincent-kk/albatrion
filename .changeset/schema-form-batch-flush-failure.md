---
"@canard/schema-form": patch
---

A value whose property access throws during a batched or Merge write no longer leaves the form silently unresponsive: the error is reported and thrown like any other write failure. Later edits continue to notify subscribers and call `onChange`, including after the form tree is rebuilt.

External error aggregation and restoration failures also leave the form ready for subsequent writes. Callback failures retain their occurrence order, and later edits continue to notify the form after a failed write.
