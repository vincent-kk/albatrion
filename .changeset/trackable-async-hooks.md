---
"@winglet/common-utils": major
---

Breaking change: `getTrackableHandler` now waits for a promise or thenable returned by `beforeExecute` or `afterExecute`. The original function starts only after `beforeExecute` fulfills, and a rejection from either hook rejects the call.

Before, `beforeExecute` could still be running when the original function started, its rejection did not stop the call, and an async `afterExecute` neither delayed `pending` becoming `false` nor affected the result. Now `pending` stays `true` until an async `afterExecute` settles, and its rejection rejects the call after `pending` is cleared. Hooks that do not return a promise or thenable keep their same-tick execution.

```ts
const save = getTrackableHandler(persist, { beforeExecute: async () => authorize() });
await save();
// Before: persist could start before authorization finished.
// After: persist starts only after authorization succeeds.
```

To keep a hook as background work that neither delays nor fails the call, do not return its promise.

Before:

```ts
getTrackableHandler(persist, { afterExecute: async () => sendMetrics() });
```

After:

```ts
getTrackableHandler(persist, {
  afterExecute: () => {
    void sendMetrics().catch(reportMetricsError);
  },
});
```
