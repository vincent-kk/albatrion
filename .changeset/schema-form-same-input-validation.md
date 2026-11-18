---
"@canard/schema-form": patch
---

A validator that writes an unchanged value back into the form now reaches a final verdict instead of repeatedly invalidating itself. Automatic and explicit validation retain results when the emitted value and context remain the same; new input, context changes, resets and replaced requests still invalidate stale results.
