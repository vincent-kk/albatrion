---
"@winglet/data-loader": major
---

Breaking change: `DataLoaderOptions` now rejects `maxBatchSize` together with `disableBatch: true`, so a call that passes both no longer compiles. The two options contradict each other, and the loader keeps only one key per call in that case, so the configured limit was dropped without any signal. An options object whose `disableBatch` is typed as `boolean`, such as one built from a flag in a variable, can no longer carry `maxBatchSize` either, because the flag may be `true`. `disableBatch: false`, and a `boolean`-typed `disableBatch` without `maxBatchSize`, are now accepted. Runtime behavior is unchanged for JavaScript callers: `disableBatch: true` wins, and `maxBatchSize` is neither read nor validated.

Before:

```ts
import { DataLoader } from "@winglet/data-loader";

new DataLoader(batchLoad, { disableBatch: true, maxBatchSize: 100 });

const options = { disableBatch: isSingleKeyBackend, maxBatchSize: 100 };
new DataLoader(batchLoad, options);
```

After:

```ts
import { DataLoader } from "@winglet/data-loader";

new DataLoader(batchLoad, { disableBatch: true });

new DataLoader(
  batchLoad,
  isSingleKeyBackend ? { disableBatch: true } : { maxBatchSize: 100 },
);
```
