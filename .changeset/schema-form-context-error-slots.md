---
"@canard/schema-form": patch
---

A new `context` value whose `Error` differs from the previous one only in `cause`, or whose `AggregateError` differs only in `errors`, is now delivered to fields that watch the context (`watch: ['@']`). Before, such a change was treated as equal and those fields kept the stale context.
