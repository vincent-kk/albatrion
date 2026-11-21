---
"@canard/schema-form": patch
---

Batched writes preserve keys from earlier writes when a later Merge omits them inside an inactive object. Emptying a child in a batch preserves a null or scalar ancestor and keeps the child's own stored edit. A virtual updater sees `undefined` for inactive or absent constituents even when an earlier write in the batch changed their retained values. An object updater receives the same stored object in a batch as in separate calls, so writes to inactive descendants do not reappear in the updater input or survive an identity Overwrite.

A failed field retries once when its error formatter changes. If the retry fails, the field stays on its fallback without reporting the original failure again. Inline formatters can be used with an `onError` callback that updates React state.
