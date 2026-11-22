---
"@canard/schema-form": patch
---

Keep EnableAutomaticWrites local to its setValue call when a batch mixes enabled and suppressed writes. An explicit DisableAutomaticWrites still suppresses automatic writes for the whole batch.
