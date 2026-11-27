---
"@canard/schema-form": patch
---

A validator that writes an unchanged value back into the form now reaches a final verdict instead of repeatedly invalidating itself. Before, any intervening commit discarded an asynchronous verdict and scheduled another run, even when the emitted value and context stayed the same. Now that verdict remains valid and pending clears; changed output or context, resets and replaced requests still invalidate stale results.

Use `FormHandle.validate()` or `node.validate()` to force validation again, including when the input has not changed.
