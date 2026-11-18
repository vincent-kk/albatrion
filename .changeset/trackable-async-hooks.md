---
"@winglet/common-utils": patch
---

Await promises and thenables returned by `getTrackableHandler` lifecycle hooks. An async `beforeExecute` now finishes before the original function starts instead of running in parallel; a rejection prevents the operation. An async `afterExecute` finishes before pending is cleared, and its rejection reaches the handler after cleanup. Synchronous hooks retain their same-tick execution.

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
