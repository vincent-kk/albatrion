---
"@winglet/common-utils": major
---

Breaking change: when `MessageChannelScheduler` has no `onTaskError`, an error thrown by a task now reaches the host instead of being discarded. This covers callbacks passed to `MessageChannelScheduler.schedule` and `setImmediate`, and callbacks passed to `scheduleMacrotask` and `scheduleCancelableMacrotask` in runtimes without a native `setImmediate`, such as browsers.

The error goes to `globalThis.reportError` when the runtime provides it, which reaches `window.onerror` and the global `error` event. In a runtime without `reportError`, a separate `setTimeout` callback rethrows it; in Node that reaches the uncaught-exception path and ends a process that has no handler. The remaining tasks of the batch still run.

To keep handling task errors yourself, pass `onTaskError` when the scheduler instance is created. `MessageChannelScheduler.getInstance` applies options only on the call that creates the instance, so make that call before the first `schedule`, `setImmediate` or browser `scheduleMacrotask` call. The handler receives the errors of all these callbacks, and they are not reported to the host unless the handler itself throws.

Before:

```ts
scheduleMacrotask(() => {
  throw new Error('task failed');
});
// In a browser, the error was discarded.
```

After:

```ts
MessageChannelScheduler.getInstance({
  onTaskError: (error, taskId) => logger.warn('task failed', taskId, error),
});
scheduleMacrotask(() => {
  throw new Error('task failed');
});
// The error reaches onTaskError and is not reported to the host.
```
