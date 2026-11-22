---
"@slats/agents-assets-sync": patch
---

Behavior change: conflicting source bytes for one physical destination now refuse the conflicting units instead of letting an arbitrary writer win. Equal source bytes still share the destination.

Keep installed files when any participant in a shared namespace fails to provide a complete plan. Discovery and gate failures also protect possible owners, and suppressed deletions are reported with their participant and reason.
