---
'@canard/schema-form': patch
---

The documentation and the packaged agent skill now state that the form assumes standard JSON values for its input and output. A getter in an input is not rejected, but the engine may read a property more than once, so a property whose value depends on when or how often it is read, or that throws, is not supported. Behavior is unchanged.
