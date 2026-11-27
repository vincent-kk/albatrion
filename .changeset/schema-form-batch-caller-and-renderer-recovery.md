---
"@canard/schema-form": patch
---

Batched writes preserve keys from earlier writes when a later Merge omits them inside an inactive object. Emptying a child in a batch preserves a null or scalar ancestor and keeps the child's own stored edit. A virtual updater sees `undefined` for inactive or absent constituents even when an earlier write in the batch changed their retained values. Object and array updaters read the same assembled values in a batch as in separate calls. Object keys follow the declared and configured order, and array children use the same output and empty-slot rules. Writes to inactive descendants stay out of the updater input.

A failed field retries once when its error formatter changes. If the retry fails, the field stays on its fallback without reporting the original failure again. Inline formatters can be used with an `onError` callback that updates React state.
