# @winglet/data-loader: bug bounty round 3

This round confirmed 4 new findings in `@winglet/data-loader`. Items in the earlier round documents ([round 1](../round-1/winglet-data-loader.md), [round 2](../round-2/winglet-data-loader.md)) were treated as fixed and excluded. The main session re-ran every probe. Verification limits are listed under the probes.

Probes: [probes/winglet-data-loader/](probes/winglet-data-loader/)

- From `r3-contracts`:
  - Probe folder in the working tree: `packages/winglet/data-loader/src/__bounty__/r3-contracts/`; the round copy is `bug-bounty/round-3/probes/winglet-data-loader/r3-contracts/`.
  - To run the copy: copy it back to `packages/winglet/data-loader/src/__bounty__/r3-contracts/` and run `yarn workspace @winglet/data-loader test --run src/__bounty__/r3-contracts/perKeyErrorCache.test.ts`.
  - Failing tests that are not findings: none.
  - Control tests that pass: "control: a batch-wide transient failure does not stick (batching-and-caching.md:170-174)".
  - Verification limits: None.
- From `r3-react-utils-data-loader`:
  - Probe folder in the working tree: `packages/winglet/data-loader/src/__bounty__/r3-react-utils-data-loader/`; the round copy is `bug-bounty/round-3/probes/winglet-data-loader/r3-react-utils-data-loader/`.
  - To run the copy: copy it back to `packages/winglet/data-loader/src/__bounty__/r3-react-utils-data-loader/` and run `yarn workspace @winglet/data-loader test --run src/__bounty__/r3-react-utils-data-loader/`. Five of the six tests fail; four of the failures are findings.
  - Failing tests that are not findings: "a thenable batch result whose then() returns a non-promise rejects the batch instead of throwing" is a rejected hypothesis. Such a thenable makes `.catch` throw out of the scheduler callback, but the `BatchLoader` type requires a `Promise`, so the input lies outside the contract.
  - Control tests that pass: "per-key Error results stay cached while batch-wide failures are cleared" is a diagnostic that records the reference-compatible caching of per-key errors.
  - Verification limits: Item A rests in part on a browser check outside the probes. In Chromium 156, driven through ego-browser, calling the bare `queueMicrotask`, `setTimeout` and `requestAnimationFrame` as a method of another object threw `TypeError: Illegal invocation`, while an arrow function wrapper worked. The probe itself runs in Node and uses a receiver-checking stand-in for those browser functions.

Root-cause files: `packages/winglet/data-loader/src/`

## 1. In a browser, passing `queueMicrotask`, `setTimeout` or `requestAnimationFrame` bare as `batchScheduler`, as the specification lists them, makes the first `load` throw `TypeError: Illegal invocation` and leaves every later `load` pending forever.

- Severity: medium. A browser application that follows the option table gets one thrown error and then a loader whose later loads never settle. The first failure surfaces as an exception, and passing a bare browser scheduler is less common usage, so the item is medium rather than high; Node servers are not affected.
- Affected public API: `new DataLoader(batchLoader, { batchScheduler })`, `load`, `loadMany`.
- Contract violated: `packages/winglet/data-loader/docs/en/SPECIFICATION.md:209` and `packages/winglet/data-loader/docs/ko/SPECIFICATION.md:209` list `queueMicrotask`, `setTimeout` and `requestAnimationFrame` by bare name as replacements for the default scheduler. The Web IDL operation steps throw a `TypeError` when the this value is an object that is not the global object ([Web IDL, create an operation function](https://webidl.spec.whatwg.org/#dfn-create-operation-function)).
- Root cause: `packages/winglet/data-loader/src/DataLoader.ts:270` calls the scheduler as `this.__batchScheduler__(() => …)`, so its this value is the `DataLoader` instance, and `packages/winglet/data-loader/src/utils/prepare.ts:22-33` stores the consumer's function without binding it. The browser function therefore throws, and the hang that follows is the mechanism of item B. The default scheduler avoids the problem only because `packages/winglet/common-utils/src/utils/scheduler/scheduleNextTick.ts` binds its functions to `globalThis`.
- Relation to earlier rounds: Same class as `../round-1/winglet-data-loader.md` item 1, a documented scheduler configuration that does not work.
- Reopens an earlier fix: No. The root lines were last changed by `017cec93b`, the fix for `../round-1/winglet-data-loader.md` item 1, and that item's symptom stays fixed; this is a different input that reaches the same function.
- Reproduction: `packages/winglet/data-loader/src/__bounty__/r3-react-utils-data-loader/dataLoader.r3.test.ts`. The test "calls batchScheduler as a plain function, not as a method of the loader" observes that the scheduler's this value is the loader, where `undefined` or the global object is expected. The test "works with a receiver-checked scheduler passed bare (as SPECIFICATION suggests for queueMicrotask)" gets `{ thrown: 'Illegal invocation', first: 'no promise', second: <timeout after 100 milliseconds> }`, where `{ thrown: null, first: { value: 10 }, second: { value: 20 } }` is expected.
- Confidence: high. Public API in Node with a receiver-checking stand-in, plus the Chromium check outside the probes that the PROBES section names as a verification limit.

## 2. After a `batchScheduler` throws synchronously once, every later `load` on that loader stays pending forever, for other keys and for the same key.

- Severity: medium. One transient scheduler exception leaves state behind that silently stops the loader for the rest of its life. A throwing scheduler is plausible but less common usage, and item A is a documented way to reach it.
- Affected public API: `load`, `loadMany`, the `batchScheduler` option.
- Contract violated: `packages/winglet/data-loader/src/INTENT.md:10` says the requests of a failed batch are all brought to an end. `packages/winglet/data-loader/src/DETAIL.md:7` says a new batch whose first request failed because `cacheKeyFn` or a custom cache threw is not registered as the current batch, which shows the intent that one exception does not stop the loader; a scheduler exception is not covered.
- Root cause: `packages/winglet/data-loader/src/DataLoader.ts:269-270` assigns `__currentBatch__ = batch` before the scheduler call succeeds. When the scheduler throws, the batch stays open, and `__findOpenBatch__` (`packages/winglet/data-loader/src/DataLoader.ts:255-260`) hands every later key to it without scheduling again, because an open batch already exists, so the batch is never dispatched. The failed key's cache entry also stays as a promise that never settles.
- Relation to earlier rounds: Sibling of `../round-1/winglet-data-loader.md` item 1, in the same scheduling function with a different failing input, and of the round 2 class of state that sticks after an error (`../round-2/README.md`).
- Reopens an earlier fix: No. The root lines were last changed by `017cec93b`, the fix for `../round-1/winglet-data-loader.md` item 1, whose symptom stays fixed.
- Reproduction: `packages/winglet/data-loader/src/__bounty__/r3-react-utils-data-loader/dataLoader.r3.test.ts`, test "later loads still settle after one synchronous scheduler exception". The actual result is `{ other: <timeout>, same: <timeout>, calls: [] }`; the expected result is that `other` settles with `{ value: 20 }` and that the same key settles as well.
- Confidence: high. Public API.

## 3. The packaged knowledge recommends returning a per-key `Error` for each failed fetch without saying that the error is cached, so a transient failure keeps rejecting every later `load()` of that key.

- Severity: low. A long-lived loader that follows the documented per-key isolation pattern for transient network failures keeps failing a key until the application calls `clear(key)`, which no document tells it to do.
- Affected public API: `DataLoader#load` and `DataLoader#loadMany` with the cache enabled.
- Contract violated: `packages/winglet/data-loader/docs/agents/skills/data-loader-skill/knowledge/advanced-patterns.md:93-110` recommends converting `Promise.allSettled` rejections into `Error` values, and `knowledge/batching-and-caching.md:174` promises that "A transient network failure cannot 'stick' a rejected promise in the cache"; that promise holds only for batch-wide failures, and neither document says per-key errors are cached.
- Root cause: `packages/winglet/data-loader/src/DataLoader.ts:821-824` rejects the key's cached promise with the returned `Error` and leaves it in the cache. This matches the upstream `dataloader` behavior and the documented `prime(key, new Error(...))` pattern, so the document, not the code, is what is wrong.
- Relation to earlier rounds: Same class as round 1 class 19, documented patterns that do not work as described.
- Reopens an earlier fix: No.
- Reproduction: `perKeyErrorCache.test.ts`, "the next load() after a transient per-key failure goes through a fresh batch": the second `load('a')` rejects with "Failed to load a: Error: ECONNRESET"; the expected result is `{ id: 'a' }`.
- Confidence: high; verified through the public API.

## 4. The specification's "TTL-Based Cache" example passes its cache as `cacheMap`, so the loader silently ignores the time-to-live cache and keeps its default `Map`.

- Severity: low. A consumer who copies the example into JavaScript, or passes the options through a variable, gets a cache that never expires; a TypeScript object literal reports the excess property instead.
- Affected public API: `new DataLoader(batchLoader, { cache })`.
- Contract violated: `packages/winglet/data-loader/docs/en/SPECIFICATION.md:378-380` and `packages/winglet/data-loader/docs/ko/SPECIFICATION.md:379` show `cacheMap: new TtlMap(60_000)`. The same package's `packages/winglet/data-loader/docs/agents/skills/data-loader-skill/SKILL.md:58` states that the option is `cache`, not `cacheMap`.
- Root cause: The example uses the wrong option name. `packages/winglet/data-loader/src/DataLoader.ts:363` reads only `options?.cache`, so `cacheMap` is never read.
- Relation to earlier rounds: Same class as `../round-1/winglet-data-loader.md` item 1, a documented example or configuration that does not work.
- Reopens an earlier fix: No.
- Reproduction: `packages/winglet/data-loader/src/__bounty__/r3-react-utils-data-loader/dataLoader.r3.test.ts`, test "the TtlMap passed as in docs/en/SPECIFICATION.md:378-380 serves the loader cache". The actual result is `{ gets: 0, sets: 0 }`; the expected result is `{ gets: 1, sets: 1 }`.
- Confidence: high. Public API, with the documented example executed literally.

## Hypotheses checked and not bugs

- From `r3-contracts`:
  - A failed dispatch resolves the batch's cache hits and then clears and rejects each key in order, as `knowledge/batching-and-caching.md:172` says (`packages/winglet/data-loader/src/utils/dispatch.ts:55-59`).
  - Helper candidates judged not to change what a consumer does: `maxBatchSize: 2.5` and `cache: true` throw at construction, so the mismatch with the documents surfaces immediately; a synchronous non-`Error` throw becoming `INVALID_BATCH_LOADER`, cache hits staying fulfilled in a failed batch against `SKILL.md:54`, and the missing README examples named by `SKILL.md:107` and `knowledge/advanced-patterns.md:3` are documentation slips.
  - `loadMany` with a `null` key throwing `INVALID_KEY` synchronously against `knowledge/advanced-patterns.md:107` was not re-examined, because round 1 classed it as documented elsewhere.
- From `r3-react-utils-data-loader`:
  - Per-key `Error` results stay in the cache while a batch-wide failure clears its keys. This matches the documented design of the reference `dataloader`, so the code is not a bug; the documentation gap about it is recorded as item 3.
  - A cache hit settles only after the fresh keys of its batch resolve. This is documented in `packages/winglet/data-loader/docs/agents/skills/data-loader-skill/knowledge/batching-and-caching.md:90` and matches the reference implementation.
  - A batch function that calls `load` again sends the new key to a new batch, because `packages/winglet/data-loader/src/DataLoader.ts:791` marks the batch as resolved before the batch loader runs.
  - `prime` after a batch-wide failure works, because `failedDispatch` clears each key before it rejects; `prime` after a per-key `Error` is a documented no-op.
  - A thenable whose `then` returns a non-promise throws out of the scheduler callback, but the `BatchLoader` type requires a `Promise`, so the input lies outside the contract.
