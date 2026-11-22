# @winglet/data-loader: bug bounty round 4

This round confirmed 3 new findings in `@winglet/data-loader`, all low. Items in the earlier round documents ([round 1](../round-1/winglet-data-loader.md), [round 2](../round-2/winglet-data-loader.md), [round 3](../round-3/winglet-data-loader.md)) were treated as fixed and excluded. The main session re-ran every probe: 13 tests, of which 9 fail and 4 pass.

Probes: [probes/winglet-data-loader/](probes/winglet-data-loader/)

- From `r4-react-utils-data-loader`:
  - Probe folder in the working tree: `packages/winglet/data-loader/src/__bounty__/r4-react-utils-data-loader/`; the round copy is `bug-bounty/round-4/probes/winglet-data-loader/r4-react-utils-data-loader/`.
  - To run the copy: copy it back to `packages/winglet/data-loader/src/__bounty__/r4-react-utils-data-loader/` and run `yarn workspace @winglet/data-loader test --run --config src/__bounty__/r4-react-utils-data-loader/vitest.config.ts src/__bounty__/r4-react-utils-data-loader/`.
  - The probe-local `vitest.config.ts` adds the `source` condition and the `@/common-utils` alias, so `@winglet/common-utils` resolves to its `src` instead of the stale `dist`.
  - Failing tests that are not findings: none. All 9 failing tests reproduce items 1 to 3.
  - Control tests that pass:
    - "@winglet/common-utils subpaths are the src modules, not dist" proves that the run loaded source.
    - "control: a batch-wide rejection does not stick; the next load fetches again" for item 1.
    - "control: a throwing first request leaves nothing in any batch" for item 3.
    - "matches Map semantics: -0 and 0 share one entry, NaN dedupes, \"1\" and 1 differ" records a checked hypothesis.
  - Verification limits: the probes ran in Node only.

Root-cause files: `packages/winglet/data-loader/` for items 1 and 3; the documentation site pages under `documents/` for item 2.

## 1. The README's "Error Handling and Retry" example returns the same `Error` for every key when the whole fetch fails, so a transient failure stays cached and the next `load()` of that key rejects again without fetching.

- Severity: low. A long-lived loader that copies the README's pattern keeps failing a key after one transient network error until the application calls `clear(key)`. The README's heading promises retry, and none of these documents says that the failed key needs `clear(key)`. The first example is the more harmful one: a batch-wide failure that the loader would clear from the cache by itself is turned into per-key errors that stay cached.
- Affected public API: `DataLoader#load` and `DataLoader#loadMany` with the cache enabled.
- Contract violated:
  - `packages/winglet/data-loader/README.md:339-370` and `packages/winglet/data-loader/README-ko_kr.md:339-370` recommend the pattern under the heading "Error Handling and Retry" without saying that per-key errors stay cached.
  - `packages/winglet/data-loader/docs/en/SPECIFICATION.md:232` and `packages/winglet/data-loader/docs/ko/SPECIFICATION.md:232` recommend `Error` instances for per-key failures without the same warning.
  - The round 3 fix added the warning only to `packages/winglet/data-loader/docs/agents/skills/data-loader-skill/knowledge/batching-and-caching.md:172`.
- Root cause: the documents. The code at `packages/winglet/data-loader/src/DataLoader.ts:840` rejects the key's cached promise with the returned `Error` and leaves it in the cache, as the round 3 known limit for `@winglet/data-loader` states.
- Relation to earlier rounds: same class as [round 3 item 3](../round-3/winglet-data-loader.md). Round 3 class 21: documents that a fix did not update.
- Reopens an earlier fix: No.
- Reproduction: `packages/winglet/data-loader/src/__bounty__/r4-react-utils-data-loader/dataLoader.r4.test.ts`.
  - "the README pattern \"If entire batch fails, return same error for each key\" lets the next load retry" gets `{ second: { error: 'ECONNRESET' }, requests: 1 }`, where `{ second: { value: { id: 'u1' } }, requests: 2 }` is expected.
  - "README.md and README-ko_kr.md mention that per-key errors stay cached until clear(key)" gets `{ en: false, ko: false }`.
  - The control "a batch-wide rejection does not stick; the next load fetches again" passes.
- Confidence: high. The README example was executed literally through the public API.

## 2. The options table on the documentation site page for `@winglet/data-loader`, in English and Korean, names options that do not exist, so they are silently ignored, and gives `cache` a boolean type that the constructor rejects.

- Severity: low. A JavaScript consumer who follows the table gets a misconfigured loader without any error:
  - `batch: false` leaves batching on.
  - `scheduler` is never called.
  - `cacheMap` is ignored, and the loader keeps its unbounded default `Map`.
  - `cache: true`, documented as a boolean with the default `true`, throws `INVALID_CACHE` at construction.
  - A TypeScript consumer gets excess property errors instead.
- Affected public API: `new DataLoader(batchLoader, options)`.
- Contract violated:
  - `DataLoaderOptions` in `packages/winglet/data-loader/src/type.ts:21` declares `name`, `cache` (`MapLike | false`), `batchScheduler`, `cacheKeyFn`, `maxBatchSize` and `disableBatch`.
  - `packages/winglet/data-loader/docs/agents/skills/data-loader-skill/SKILL.md:58-64` states that the option is `cache`, not `cacheMap`, and that `cache: true` is rejected.
- Root cause:
  - `documents/docs/winglet/data-loader/index.mdx:48-53` and `:134-139`.
  - `documents/i18n/ko/docusaurus-plugin-content-docs/current/winglet/data-loader/index.mdx:48-53` and `:111-116`.
  - These pages are maintained by hand, and the site generator never touches them (`documents/scripts/sync-winglet-docs.ts:8`). The fix of round 3 item 4 corrected only the `cacheMap` example in the specification.
- Relation to earlier rounds: same class as [round 3 item 4](../round-3/winglet-data-loader.md) and as [round 1 item 1](../round-1/winglet-data-loader.md): a documented configuration that does not work.
- Reopens an earlier fix: No. No bug bounty fix commit touched either page.
- Reproduction: `packages/winglet/data-loader/src/__bounty__/r4-react-utils-data-loader/dataLoader.r4.test.ts`, describe "documentation site options table". All five tests fail.
  - "every documented option name is an option the loader reads (en and ko)" finds `batch`, `cacheMap` and `scheduler` in both pages.
  - "documented `scheduler` option controls batching timing" counts 0 scheduler calls, where 1 is expected.
  - "documented `cacheMap` option replaces the default Map" counts `{ get: 0, set: 0 }`, where `{ get: 1, set: 1 }` is expected.
  - "documented `batch: false` disables request batching" gets the batches `[[1, 2]]`, where `[[1], [2]]` is expected.
  - "documented `cache: true` (type boolean, default true) is accepted" gets the error "DataLoaderOptions > cache must additionally implement the following methods: get, set, delete, clear".
- Confidence: high. Public API.

## 3. When a custom cache's `set()` throws while a batch is open, the `load()` call throws, but its key stays in the batch, reaches the batch function and later causes an unhandled rejection.

- Severity: low. The key of a call that already threw is still sent to the batch loader. When that key receives an `Error`, or the batch fails as a whole, a promise that no caller holds is rejected, and in Node's default mode an unhandled rejection ends the process. The same failure on the first request of a new batch leaves nothing behind. A cache whose `set()` throws for some keys is uncommon; a `WeakMap`-backed cache that receives a primitive key is one example.
- Affected public API: `DataLoader#load`, `DataLoader#loadMany`, the `cache` option.
- Contract violated:
  - `packages/winglet/data-loader/src/DETAIL.md:7` says that a new batch whose first request failed because a custom cache threw is not registered, which states the intent that one exception leaves nothing behind.
  - `packages/winglet/data-loader/src/INTENT.md:10` says that every request of a failed batch is brought to an end.
  - Predictability: the same throwing call has different side effects depending on whether a batch was already open.
- Root cause:
  - `packages/winglet/data-loader/src/DataLoader.ts:447-448` calls `enqueueKey(batch, key)` before `cacheMap.set(cacheKey, promise)`.
  - The cleanup block at `packages/winglet/data-loader/src/DataLoader.ts:451-465` guards only the scheduling of a new batch.
  - When `set()` throws for a key added to an already open batch, the key and its resolver stay in that batch. Its promise is never returned to a caller.
- Relation to earlier rounds: same class as [round 3 item 2](../round-3/winglet-data-loader.md), state that a synchronous exception inside `load` leaves behind, and round 3 class 26: errors that vanish or state that sticks.
- Reopens an earlier fix: No. The lines were last changed by `017cec93b` and `d5c52655c`, the fixes of [round 1 item 1](../round-1/winglet-data-loader.md) and [round 1 item 2](../round-1/winglet-data-loader.md), whose symptoms stay fixed.
- Reproduction: `packages/winglet/data-loader/src/__bounty__/r4-react-utils-data-loader/dataLoader.r4.test.ts`.
  - "a load() that throws while a batch is open leaves nothing in that batch" gets the batch calls `[[{ id: 1 }, 'primitive']]`, where `[[{ id: 1 }]]` is expected.
  - "the thrown load() does not produce an unhandled rejection later" records `['Error: no primitive']`, where no unhandled rejection is expected.
  - The control "a throwing first request leaves nothing in any batch" passes.
- Confidence: high. Public API.

## Hypotheses checked and not bugs

- With the default cache, `-0` and `0` share one entry, `NaN` is deduplicated, and `'1'` and `1` are separate entries, which matches the SameValueZero semantics of `Map`.
- A batch-wide rejection does not stick, and the next `load()` fetches again.
- `loadMany` and a loop of `load` throw at the same point for every synchronous failure: a nil key, a throwing `cacheKeyFn`, a throwing scheduler and a throwing `set()`.
- Two loaders that share one cache map follow each other's promises as cache hits, and the loader whose batch fails clears the shared key. `packages/winglet/data-loader/docs/agents/skills/data-loader-skill/SKILL.md` warns about shared caches.
- `cacheKeyFn` and the batch loader receive the loader as their `this` value, but no document suggests passing a bare Web IDL function for either of them, so the receiver problem of round 3 item 1 has no documented trigger there.
- `prime(key, promise)` with a promise that later rejects can produce an unhandled rejection. That rejection belongs to the consumer's own promise, and the documented no-op `catch` covers `Error` values only.
- `loadMany` places a rejection reason that is not an `Error` into its result array unchanged. The reference implementation `dataloader` does the same.
