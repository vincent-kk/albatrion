---
"@winglet/common-utils": major
---

Breaking change: task errors from `MessageChannelScheduler` without `onTaskError` now reach the host instead of being silently discarded. A previously invisible error can reach `window.onerror`, the unhandled error path, or Node's uncaught-exception path and terminate a process without a handler.

Before:

```ts
MessageChannelScheduler.getInstance().schedule(() => { throw new Error('task failed'); });
// The error was discarded.
```

After:

```ts
MessageChannelScheduler.getInstance().schedule(() => { throw new Error('task failed'); });
// The error reaches reportError, or a separate native timer throws it.
```

A consumer-provided `onTaskError` receives errors from both directly scheduled and browser-wrapper tasks, with no additional host report. The first singleton options still apply; batching, limits, cancellation and destruction remain shared. Configure an explicit handler to consume errors. The host fallback does not schedule through `MessageChannelScheduler`.
