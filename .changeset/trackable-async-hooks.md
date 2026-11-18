---
"@winglet/common-utils": major
---

Breaking change: `getTrackableHandler` starts the original function only after an asynchronous `beforeExecute` fulfills, and a hook rejection now rejects the call.

Previously, `beforeExecute` could still be running when the original function started, and its rejection did not block execution. Promises and thenables returned by lifecycle hooks are now awaited. An async `afterExecute` finishes before pending is cleared, and its rejection reaches the handler after cleanup. Synchronous hooks retain their same-tick execution.

Before:

```ts
const save = getTrackableHandler(persist, { beforeExecute: async () => authorize() });
await save(); // persist could start before authorization finished
```

After:

```ts
const save = getTrackableHandler(persist, { beforeExecute: async () => authorize() });
await save(); // persist starts only after authorization succeeds
```
