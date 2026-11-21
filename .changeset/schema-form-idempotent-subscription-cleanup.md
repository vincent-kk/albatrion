---
"@canard/schema-form": patch
---

Calling a subscribe cleanup more than once no longer removes listeners registered after the original subscription ended. Later fields and consumers continue receiving their node events.
