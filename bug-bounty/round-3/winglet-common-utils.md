# @winglet/common-utils: bug bounty round 3

This round confirmed 15 new findings in `@winglet/common-utils`. Items in the earlier round documents ([round 1](../round-1/winglet-common-utils.md), [round 2](../round-2/winglet-common-utils.md)) were treated as fixed and excluded. The main session re-ran every probe. Verification limits are listed under the probes.

Probes: [probes/winglet-common-utils/](probes/winglet-common-utils/)

- From `r3-contracts`:
  - Probe folder in the working tree: `packages/winglet/common-utils/src/__bounty__/r3-contracts/`; the round copy is `bug-bounty/round-3/probes/winglet-common-utils/r3-contracts/`.
  - To run the copy: copy it back to `packages/winglet/common-utils/src/__bounty__/r3-contracts/` and run `yarn workspace @winglet/common-utils test --run src/__bounty__/r3-contracts/packaging.test.ts`, `yarn workspace @winglet/common-utils test --run src/__bounty__/r3-contracts/platformNeutralTypes.test.ts` and `yarn workspace @winglet/common-utils test --run src/__bounty__/r3-contracts/degenerateReturn.test.ts`.
  - Failing tests that are not findings: none.
  - Control tests that pass: in `packaging.test.ts`, the run-time `require` of the CommonJS builds, "control: an ESM TypeScript consumer (module node16) type-checks the same imports" and "control: a CommonJS consumer on module nodenext (TypeScript 5.8+ require of ESM) type-checks", plus plain resolution and bundling without the `source` condition; in `platformNeutralTypes.test.ts`, "control: with the DOM library the utility declarations type-check"; in `degenerateReturn.test.ts`, "control: factorial, a documented exception, throws on invalid input".
  - Verification limits: `packaging.test.ts` and `platformNeutralTypes.test.ts` type-check the local `dist` declarations, which predate the round 2 fixes. `platformNeutralTypes.test.ts` filters out the stale `isBuffer.d.ts` diagnostic of `../round-2/winglet-common-utils.md` item 9, which is fixed in source, and the `File`, `Blob` and `AbortSignal` type text it reports is unchanged in the current source. The `@types/node` 18 globals are emulated by a minimal ambient declaration because only `@types/node` 20 is installed.
- From `r3-common-utils`:
  - Probe folder in the working tree: `packages/winglet/common-utils/src/__bounty__/r3-common-utils/`; the round copy is `bug-bounty/round-3/probes/winglet-common-utils/r3-common-utils/`.
  - To run the copy: copy it back to `packages/winglet/common-utils/src/__bounty__/r3-common-utils/` and run `yarn workspace @winglet/common-utils test --run src/__bounty__/r3-common-utils`. A single file runs with `yarn workspace @winglet/common-utils test --run src/__bounty__/r3-common-utils/<file>`, and a single test with `-t "<test name>"` added.
  - Failing tests that are not findings: `throttle.test.ts` "a function that re-triggers its own throttle runs about once per window (real timers)" is a measurement whose result depends on timing. It failed alone with 717 runs against a limit of 45 and passed in a full run, so item A rests on the fake-timer test for the same case instead. Every other failing test reproduces an item below. "never runs three times inside one window when fed every few milliseconds" is also a real-timer measurement, but it failed in both runs (21 and 26 triple runs) and is used as evidence for item A.
  - Control tests that pass: in `throttle.test.ts`, debounce `clear()` followed by a call, a trailing-only throttle fed by an interval of the same period, and lodash `throttle` under the same high-frequency and self-re-triggering feeds (zero triple runs, at most 45 runs). In `realm.test.ts`, `equals`, `stableEquals`, `cloneLite` and `merge` on values from another realm, `stringifyGraph` on a foreign plain object (it encodes or throws `TypeError`), and `clone` of a foreign `Uint8Array`. All of `murmur3.test.ts` passes: 3,000 incremental byte cases against a reference implementation, 3,000 split string cases against the one-shot hash, and constructor seeding against `reset` seeding.
  - Verification limits specific to this package: the scheduler probes in `scheduler.test.ts` replace the host `MessageChannel` with a stand-in that delivers messages as macrotasks and records exceptions that escape `onmessage`, the way a browser reports them to `window.onerror`; item D also deletes `setImmediate` and `clearImmediate` to take the browser path. The other-realm probes create values with `node:vm` `runInNewContext`; no iframe was tested.

Root-cause files: `packages/winglet/common-utils/`

## 1. `throttle` stops throttling after `clear()` or at a window boundary, and with `leading: false` it never runs the last call.

- Severity: high. An application that throttles scroll handlers, autosaves or double-click protection sees the function run several times inside one window, and a trailing-only throttle silently drops its final call, so the last value is never saved.
- Affected public API: `throttle` (package root and the `function` subpath).
- Contract violated: `packages/winglet/common-utils/src/utils/function/rateLimit/DETAIL.md:6` says a throttled function runs at most once per window, line 33 says every window repeats the same leading and trailing pattern, and line 8 defines `clear` as cancelling the scheduled run. `packages/winglet/common-utils/docs/agents/skills/common-utils-skill/knowledge/semantics.md` recommends `leading: true, trailing: false` for double-click protection.
- Root cause: `packages/winglet/common-utils/src/utils/function/rateLimit/throttle.ts:232` decides an immediate run from `context.isIdle` (whether a timer exists), while `throttle.ts:237` opens a new window only when `Date.now() - previous > ms`, with `previous` declared at `throttle.ts:229`. `clear()` (`throttle.ts:248`, `packages/winglet/common-utils/src/utils/function/rateLimit/helpers/FunctionContext.ts:130`) removes the timer but keeps `previous`, and a timer that fires exactly `ms` after the window opened (`FunctionContext.ts:168`) leaves `Date.now() - previous === ms`, which the strict comparison rejects. In both states no timer exists and no window opens, so with `leading: true` every call runs at once and schedules nothing, and with `leading: false` every call is stored without a timer and never runs; a function that calls its own throttle from the trailing run recurses synchronously.
- Relation to earlier rounds: New class. `../round-1/winglet-common-utils.md` lists, among hypotheses that are not bugs, a trailing run at the end of a window followed by a leading run of the next window; this item goes beyond that case, with three or more runs inside one window and dropped calls. The existing test in `packages/winglet/common-utils/src/utils/function/rateLimit/__tests__/throttle.test.ts` that pins one leading run after a trailing run does not conflict with it.
- Reopens an earlier fix: No. `git log -L` on the root cause lines shows only `aa2051ea4` and `e0edebe70`, and the round 1 fix `cdc6a2942` did not touch `throttle.ts`.
- Reproduction: `throttle.test.ts`. "after clear(), calls inside the old window are still throttled" runs the function 4 times in one window where at most 2 are expected. "after clear(), a trailing-only throttle still delivers the next call" records `[]` where `[[2]]` is expected. "a call that lands exactly when the window timer fires does not disable throttling" runs 3 times after the boundary where at most 1 is expected. "a trailing-only call that lands exactly when the window timer fires is delivered" records `[[1]]` where `[[1], [2]]` is expected. "never runs three times inside one window when fed every few milliseconds" (real timers, a 30 millisecond window fed every millisecond for 1.5 seconds) found 21 and then 26 triple runs within 15 milliseconds where 0 are expected, and lodash found 0 under the same feed. "a function that re-triggers its own throttle runs once per window (fake timers)" runs 500 times synchronously where at most 3 are expected. "a function that always re-triggers its own throttle does not overflow the stack" throws `RangeError: Maximum call stack size exceeded` where no error is expected.
- Confidence: high; public API.

## 2. An async `beforeExecute` or `afterExecute` hook of `getTrackableHandler` that rejects neither stops the original function nor fails the handler call.

- Severity: medium. A submit guard written as `beforeExecute: async () => { await check(); }` lets the submission run even when the check rejects, and an async `afterExecute` that rejects leaves the handler resolved with the original result while the error surfaces only as an unhandled rejection. The main session downgraded this from high because the hook type returns `void`, async hooks are less common, and the rejection still surfaces as an unhandled rejection; the owner decides whether hooks are awaited or typed as synchronous only.
- Affected public API: the `beforeExecute` and `afterExecute` options of `getTrackableHandler` (package root and the `function` subpath).
- Contract violated: `packages/winglet/common-utils/src/utils/function/enhance/getTrackableHandler/getTrackableHandler.ts:279` says errors in `beforeExecute` prevent the original function from running and propagate immediately, and `getTrackableHandler.ts:281` says errors in `afterExecute` propagate after cleanup; `packages/winglet/common-utils/src/utils/function/enhance/getTrackableHandler/DETAIL.md:31` and `:32` say the same. The JSDoc examples at `getTrackableHandler.ts:152` and `:294` write `afterExecute: async (args, stateManager) => …`, and the hook type `Fn<[args, stateManager]>` defaults its return type to `void` (`packages/aileron/common/declare/function.d.ts:1`), so it accepts async functions.
- Root cause: `getTrackableHandler.ts:419` calls `beforeExecute?.(args, stateManager)` and `getTrackableHandler.ts:441` calls `afterExecute?.(args, stateManager)` without looking at the returned value. A rejected promise from either hook never reaches the surrounding `try`, `catch` or `finally`, so it does not stop the original function or change the handler's result.
- Relation to earlier rounds: Same function and the same class (8, errors that vanish or state that sticks) as `../round-2/winglet-common-utils.md` items 2 and 5.
- Reopens an earlier fix: No. The round 2 fix `1ce17f0cc` for items 2 and 5 last touched these lines, and its behavior still holds.
- Reproduction: `trackable.test.ts`. "an async beforeExecute that rejects keeps the original function from running" calls the original function once where zero calls are expected. "an async afterExecute that rejects propagates like a throwing afterExecute" records `{ outcome: 'resolved:ok', unhandled: 1 }` where `{ outcome: 'rejected:afterExecute failed', unhandled: 0 }` is expected.
- Confidence: high; public API.

## 3. When `onTaskError` throws, `MessageChannelScheduler` re-runs the failing task on every later flush and never runs the other tasks.

- Severity: medium. An application that configures `onTaskError: (error) => { throw error; }` to make task errors visible loses the rest of the failing batch and every task scheduled afterwards, while the failing task keeps running again; the scheduler stays stalled.
- Affected public API: `MessageChannelScheduler.getInstance({ onTaskError })` and its `schedule` method (package root and the `scheduler` subpath).
- Contract violated: `packages/winglet/common-utils/src/utils/scheduler/MessageChannelScheduler/DETAIL.md:7` states the invariant that keeps the scheduler from stopping permanently, `DETAIL.md:43` says the tasks before and after a throwing task in the same batch still run, and `packages/winglet/common-utils/src/utils/scheduler/MessageChannelScheduler/MessageChannelScheduler.ts:83` says errors are isolated per task without affecting others.
- Root cause: in the message handler (`MessageChannelScheduler.ts:300` to `:308`), `task()` runs inside `try`, but the `catch` calls `__handleTaskError__`, whose `errorHandler(...)` call at `MessageChannelScheduler.ts:322` is not protected. When it throws, `pendingTasks.delete(taskId)` at `MessageChannelScheduler.ts:306` and the new flush request at `MessageChannelScheduler.ts:308` never run, while `__idle__` was already set to `true` at `MessageChannelScheduler.ts:295`. The failing task stays first in the queue, so every flush that a later `schedule()` starts runs it again, it throws again, and the tasks behind it never run.
- Relation to earlier rounds: Sibling of `../round-2/winglet-common-utils.md` item 2 (a callback that throws leaves state stuck), class 8.
- Reopens an earlier fix: No.
- Reproduction: `scheduler.test.ts`, "runs the rest of the batch once, does not re-run the failing task, and keeps scheduling". Actual `['a', 'a', 'a']`, expected `['a', 'b', 'c', 'd', 'e']`. The test installs the stand-in `MessageChannel` described under PROBES.
- Confidence: high; public API with the host channel replaced.

## 4. In a browser, an exception thrown by a `scheduleMacrotask` callback is reported nowhere.

- Severity: medium. Every browser takes this path because browsers have no `setImmediate`, so a bug in a callback of `scheduleMacrotask` or `scheduleCancelableMacrotask` never reaches the console or `window.onerror`, while Node (native `setImmediate`) and `scheduleMacrotaskSafe` (the `setTimeout` fallback) surface the same exception. `@canard/schema-form` schedules validation through `scheduleCancelableMacrotask` (`packages/canard/schema-form/src/core/engine/validationScheduling/utils/cadence/utils/requestValidationCadence.ts:22` and its siblings).
- Affected public API: `scheduleMacrotask`, `scheduleCancelableMacrotask` and `setImmediate` (package root and the `scheduler` subpath).
- Contract violated: `packages/winglet/common-utils/src/utils/scheduler/scheduleMacrotask.ts:282` promises error isolation, which says nothing about discarding errors, and `scheduleMacrotask.ts:283` promises predictable execution across environments; the same call gives different results in Node and in a browser. `packages/winglet/common-utils/src/utils/scheduler/MessageChannelScheduler/DETAIL.md:8` says that, for the class, task errors go only to `onTaskError`; this item concerns the wrapper functions, which install no handler and document no way to pass one.
- Root cause: `packages/winglet/common-utils/src/utils/scheduler/MessageChannelScheduler/handler.ts:38` creates the global instance with `MessageChannelScheduler.getInstance()` and no options, and `scheduleMacrotask.ts:81` uses it as the fallback when `setImmediate` is missing. `packages/winglet/common-utils/src/utils/scheduler/MessageChannelScheduler/MessageChannelScheduler.ts:321` returns without doing anything when no error handler is configured, so the caught exception is discarded.
- Relation to earlier rounds: Same class (8, errors that vanish) as `../round-2/winglet-common-utils.md` item 2.
- Reopens an earlier fix: No.
- Reproduction: `scheduler.test.ts`, "an exception thrown by the callback reaches the host instead of vanishing". The test deletes `setImmediate` and `clearImmediate`, installs the stand-in channel and imports the module again. Errors reported to the host or `console.error`: actual 0, expected 2.
- Confidence: high for the behavior and medium for the classification; public API with the host channel replaced.

## 5. `clone` turns a `Map`, `Set`, `Date`, `RegExp` or `ArrayBuffer` from another realm into an object that cannot be used.

- Severity: medium. Data that comes from a same-origin iframe or a `vm` context clones into objects whose every method throws an incompatible-receiver error, and an `ArrayBuffer` clone silently reads as zero bytes.
- Affected public API: `clone` (package root and the `object` subpath).
- Contract violated: `packages/winglet/common-utils/src/utils/object/clone.ts:158` lists "Date, RegExp, Map, Set, Error (including `AggregateError`), boxed Number, String and Boolean from any realm" as supported built-ins. In the same package, `equals`, `stableEquals` and `cloneLite` handle the same inputs correctly.
- Root cause: `clone.ts:266` (`Date`), `:272` (`RegExp`), `:279` (`Map`), `:290` (`Set`), `:311` (`isArrayBuffer`, which uses `instanceof`) and `:317` (`DataView`) branch on this realm's constructors, so a value from another realm passes all of them. The tag-based `isCloneable` check at `clone.ts:374` then accepts it, and `Object.create(prototype)` at `clone.ts:379` builds an object without the internal slot the built-in methods need.
- Relation to earlier rounds: Same function and class as `../round-1/winglet-common-utils.md` item 4 (a built-in cloned into a broken copy) and its follow-up fix `6da60798f`, which repaired boxed primitives from another realm. The round 1 known limit about forged tags without a value slot does not cover these values, which do have their slots.
- Reopens an earlier fix: No. `git log -L` on the dispatch lines shows `0c9f68cba`, `d5b330ca5` and `26448a8f1`.
- Reproduction: `realm.test.ts`. "a foreign Map clone is a working Map with the same entries" reads "Method Map.prototype.get called on incompatible receiver #<Map>" where `1` is expected. "a foreign Set clone is a working Set", "a foreign Date clone keeps its time" ("this is not a Date object."), "a foreign RegExp clone still matches" and "a plain object holding a foreign Map clones into a usable structure" fail the same way. "a foreign ArrayBuffer clone keeps its bytes" reads `[]` where `[1, 2, 3]` is expected.
- Confidence: high; public API, with values created through `node:vm`.

## 6. A CommonJS TypeScript consumer on `module: node16` or `node18` gets error TS1479 on every import of fourteen packages whose CommonJS builds load correctly at run time.

- Severity: low. A Node project without `"type": "module"` (the `@tsconfig/node18` base, for example) cannot type-check an import of these packages, although its `require` loads `dist/index.cjs` without error, because the only declarations are ESM-flavored.
- Affected public API: every entry point of `@winglet/common-utils`, `@winglet/data-loader`, `@winglet/json`, `@winglet/json-schema`, `@winglet/react-utils`, `@winglet/style-utils`, `@canard/schema-form`, `@canard/schema-form-ajv6-plugin`, `@canard/schema-form-ajv7-plugin`, `@canard/schema-form-ajv8-plugin` (including `./2019` and `./2020`), `@canard/schema-form-antd5-plugin`, `@canard/schema-form-antd6-plugin`, `@canard/schema-form-antd-mobile-plugin` and `@canard/schema-form-mui-plugin`. `@lerx/promise-modal` is excluded because `packages/lerx/promise-modal/docs/en/SPECIFICATION.md:257` documents that it supplies no `.d.cts` declarations, and `@slats/agents-assets-sync` is ESM-only.
- Contract violated: each package's `exports` offers a `require` condition, which promises CommonJS consumers; only `@lerx/promise-modal` documents that CommonJS TypeScript declarations are missing.
- Root cause: each `exports["."]` gives one `types` target (for example `packages/winglet/common-utils/package.json:36`) inside a `"type": "module"` package (`:33`), so TypeScript reads the declaration as ESM for the `require` branch too. The declaration check `packages/aileron/script/build/verifyDeclarations.mjs:19` and `:25-27` creates only a `{"type":"module"}` consumer, so the CommonJS consumer path is never verified.
- Relation to earlier rounds: New class (the declared module format differs from the run-time format).
- Reopens an earlier fix: No.
- Reproduction: `packaging.test.ts`, "a CommonJS TypeScript consumer (module node16) imports the packages that its runtime require() loads": the actual result is eight TS1479 diagnostics, one per imported package in the probe, the expected result is none.
- Confidence: high; verified by a TypeScript program over the workspace packages as installed through `node_modules` links.

## 7. Every published package's `exports` carries a `source` condition that points to `./src/index.ts`, which the package does not ship, so a consumer that enables a `source` condition cannot resolve the package.

- Severity: low. A consumer that adds the generic `source` condition for its own monorepo live types (Vite `resolve.conditions`, esbuild `conditions`, Node `--conditions=source`) fails to resolve any of the sixteen packages, including the already published 0.16.1 tarball of `@canard/schema-form`.
- Affected public API: every `exports` entry of all sixteen published packages: `@winglet/common-utils`, `@winglet/data-loader`, `@winglet/json`, `@winglet/json-schema`, `@winglet/react-utils`, `@winglet/style-utils`, `@lerx/promise-modal`, `@slats/agents-assets-sync`, `@canard/schema-form`, `@canard/schema-form-ajv6-plugin`, `@canard/schema-form-ajv7-plugin`, `@canard/schema-form-ajv8-plugin`, `@canard/schema-form-antd5-plugin`, `@canard/schema-form-antd6-plugin`, `@canard/schema-form-antd-mobile-plugin` and `@canard/schema-form-mui-plugin`.
- Contract violated: the Node.js conditional exports algorithm (https://nodejs.org/api/packages.html#conditional-exports) uses the first matching condition's target without falling back, so a published target must exist; this is basic correctness (a resolution failure).
- Root cause: `exports` lists `"source": "./src/index.ts"` (for example `packages/winglet/common-utils/package.json:37` and `packages/canard/schema-form/package.json:33`), but `files` excludes `src` (`packages/winglet/common-utils/package.json:123`, `packages/canard/schema-form/package.json:45`), and `yarn pack` in `scripts/PUBLISHING.md` leaves the condition in place. Only the build reads it (`packages/aileron/script/build/utils/getEntrypoints.mjs:2-3` and each `rolldown.config.mjs` through `mainEntry.source`).
- Relation to earlier rounds: New class (an export condition that points to an unpublished file).
- Reopens an earlier fix: No.
- Reproduction: `packaging.test.ts`. "the published package resolves under a consumer that enables the \"source\" export condition": with `--conditions=source`, both the published `@canard/schema-form` 0.16.1 tarball and a packed copy of `@winglet/common-utils` fail with `Cannot find module '…/src/index.ts'`; the expected result is `resolved`. "a bundler (esbuild) configured with the \"source\" condition bundles the packed package": the actual result is `Could not resolve "@winglet/common-utils"`, the expected result is `bundled`.
- Confidence: high for the mechanism, medium for how often consumers use the unprefixed `source` name; verified against the published tarball and a packed copy.

## 8. The published declarations of `isFile`, `isBlob`, `delay` and the rate-limit options require the global types `File`, `Blob` and `AbortSignal`, so `skipLibCheck: false` type checks fail without the DOM library or with `@types/node` older than 20.

- Severity: low. A Node project that the README supports (Node 14 or later) but that uses `@types/node` 18 without the DOM library fails at `isFile.d.ts`, and a platform-neutral consumer with only the ES2022 library fails at four declarations; with `skipLibCheck: true` the types silently become `any`.
- Affected public API: the root entry and the `./filter`, `./promise` and `./function` subpaths (`isFile`, `isBlob`, `delay`, `debounce` and `throttle` options). The declarations of `@winglet/json`, `@winglet/json-schema` and `@winglet/data-loader` import only unaffected subpaths.
- Contract violated: `packages/winglet/common-utils/README.md:104-107` lists Node.js 14.0.0 or higher and modern browsers as supported environments.
- Root cause: `packages/winglet/common-utils/src/utils/filter/isFile.ts:355` declares `value is File`, `src/utils/filter/isBlob.ts:374` declares `value is Blob`, and `src/utils/promise/delay.ts:40` and `src/utils/function/rateLimit/helpers/type.ts:84` declare `signal?: AbortSignal`, all as bare global types. The round 2 fix made only `isBuffer` conditional on the available globals.
- Relation to earlier rounds: Sibling of `../round-2/winglet-common-utils.md` item 9 (a different function).
- Reopens an earlier fix: No. No bug bounty commit touched these lines.
- Reproduction: `platformNeutralTypes.test.ts`. "the utility declarations type-check for a platform-neutral consumer (lib ES2022, no DOM, no Node types)": the actual result is TS2304 for `Blob`, `File` and `AbortSignal` (four diagnostics), the expected result is none. "the utility declarations type-check with the Node 18 globals …": the actual result is TS2304 for `File`, the expected result is none.
- Confidence: high; verified against the built declarations, and the same type text is in the current source.

## 9. The packaged knowledge says that only `factorial` and `fibonacci` throw on invalid input, but `combination`, `permutation`, `digitSum`, `toBase`, `fromBase` and several other exports throw.

- Severity: low. A consumer or agent that trusts the documented "degenerate return over throw" rule calls these functions on user input without a guard and gets an uncaught exception.
- Affected public API: `combination`, `permutation`, `digitSum`, `toBase`, `fromBase`, and, by code reading, `Murmur3`, `stringifyGraph` and `parseGraph`, and `createFingerprintFactory`.
- Contract violated: `packages/winglet/common-utils/docs/agents/skills/common-utils-skill/SKILL.md:14`, and `knowledge/semantics.md:198` ("Nothing here throws" under "Degenerate returns") and `:221`. The JSDoc of each throwing function agrees with the code, so only the packaged knowledge is wrong.
- Root cause: `src/utils/math/combination.ts:64`, `permutation.ts:64`, `digitSum.ts:61`, `toBase.ts:72` and `fromBase.ts:70` throw on invalid input, and the packaged knowledge was not updated to match.
- Relation to earlier rounds: Same class as round 1 class 19, documented examples or configurations that do not work.
- Reopens an earlier fix: No.
- Reproduction: `degenerateReturn.test.ts`, "other exports return a degenerate value instead of throwing on invalid input": the actual result is a thrown error for each of the five functions (for example "Combination is only defined for non-negative integers"), and the documented expectation is `returned`.
- Confidence: high; verified through the public API.

## 10. A `getTrackableHandler` subscriber that throws on the completion notification hides the completion from later subscribers and turns a resolved call into a rejection.

- Severity: low. It needs a subscriber that throws; when one does, subscribers registered after it keep showing a pending state, and the original function's result is replaced by the subscriber's error.
- Affected public API: `subscribe` on the handler that `getTrackableHandler` returns.
- Contract violated: `packages/winglet/common-utils/src/utils/function/enhance/getTrackableHandler/DETAIL.md:8` says every subscriber is notified exactly twice per call, at start and at completion, and `packages/winglet/common-utils/src/utils/function/enhance/getTrackableHandler/getTrackableHandler.ts:282` says update failures do not affect subscriber notifications.
- Root cause: `publish` at `getTrackableHandler.ts:374` to `:377` loops over the listeners with no isolation between them, so one listener's exception stops the remaining notifications. The completion notification at `getTrackableHandler.ts:445` is the last statement of the inner `finally`, so its exception replaces the original function's return value.
- Relation to earlier rounds: Sibling of `../round-2/winglet-common-utils.md` item 2, in the same function with a different mechanism: that item was the position of the cleanup relative to the start notification, and this one is the missing isolation inside `publish`. The round 2 regression test `packages/winglet/common-utils/src/utils/function/enhance/getTrackableHandler/__tests__/getTrackableHandler.round2.test.ts` pins that a start-notification error propagates as the handler's rejection, so the main symptom here is the missing completion notification.
- Reopens an earlier fix: No. The round 2 fix `1ce17f0cc` moved the completion notification into the inner `finally`, and round 2 item 2's `pending` reset still holds.
- Reproduction: `trackable.test.ts`. "a subscriber that throws on the completion notification does not hide the completion from later subscribers" records `[true]` where `[true, false]` is expected. "a subscriber that throws on the completion notification does not turn a resolved call into a rejection" rejects with the subscriber's error where a resolution with `'done'` is expected.
- Confidence: high; public API.

## 11. `withTimeout` calls `fn` even when the signal it receives is already aborted.

- Severity: low. An operation the caller has already cancelled, such as a POST request, still starts once; its result is discarded but its side effects remain.
- Affected public API: `withTimeout` (package root and the `promise` subpath).
- Contract violated: `packages/winglet/common-utils/src/utils/promise/withTimeout.ts:18` documents `options.signal` as an AbortSignal that cancels both the function and the timeout, and `withTimeout.ts:372` repeats it; `delay` creates no timer for an already-aborted signal (`packages/winglet/common-utils/src/utils/promise/DETAIL.md`, acceptance group delay-abort-contract). `promise/DETAIL.md` says `fn()` is called before the abort listener is registered so that a synchronous throw leaves no listener behind, but neither the documents nor the tests say whether `fn` runs when the signal is already aborted.
- Root cause: `withTimeout.ts:421` (`const pending = fn();`) runs unconditionally before the already-aborted check at `withTimeout.ts:426`, so the function starts before the call learns that it has been cancelled.
- Relation to earlier rounds: Same function and input as `../round-1/winglet-common-utils.md` item 3, whose fix covered only the rejection timing.
- Reopens an earlier fix: Round 1 common-utils item 3, fix `e789d53cf`. That fix made an already-aborted signal reject at once with `AbortError` but left `fn` running; the `fn()` call itself predates it (`0c9f68cba`).
- Reproduction: `promise.test.ts`, "does not start the operation it was asked to cancel". `fn` is called once where zero calls are expected.
- Confidence: high for the behavior and medium for the classification; public API.

## 12. A wait longer than 2^31 − 1 milliseconds (about 24.8 days), or `Infinity`, ends after about one millisecond.

- Severity: low. The inputs are rare, but the result is silently wrong: `withTimeout(fn, Infinity)` used as "no limit" rejects at once with `TimeoutError`, `delay(2 ** 31)` resolves at once, and `debounce(fn, 2 ** 31)` runs at once.
- Affected public API: `delay`, `timeout`, `withTimeout`, `debounce` and `throttle`.
- Contract violated: `packages/winglet/common-utils/src/utils/promise/withTimeout.ts:16` describes `ms` as the maximum execution time and `packages/winglet/common-utils/src/utils/promise/delay.ts:51` as the delay duration, with no stated range; the parameter type is `number`.
- Root cause: `delay.ts:309` to `:313` and `packages/winglet/common-utils/src/utils/function/rateLimit/helpers/FunctionContext.ts:167` to `:172` pass `ms` straight to `setTimeout`. Node replaces a delay above 2^31 − 1 with 1 and browsers truncate it to a 32-bit integer, so the timer fires almost immediately.
- Relation to earlier rounds: New class.
- Reopens an earlier fix: No.
- Reproduction: `promise.test.ts`. "delay(2 ** 31) is still waiting after 100ms" records `settled`. "withTimeout(fn, Infinity) does not time out after 100ms" and "withTimeout(fn, 30 days) does not time out after 100ms" record `rejected:Timeout`. "debounce(fn, 2 ** 31) has not run after 100ms" records one call. Each expects the wait to still be pending, or the function not yet called, after 100 milliseconds.
- Confidence: high; public API.

## 13. `createSafeFingerprint` keys a plain object or `Date` from another realm by reference instead of by content.

- Severity: low. Equal data from another realm gets different cache keys, and an object changed in place keeps its key, so a cache keyed on it returns stale results.
- Affected public API: `createSafeFingerprint` and `createFingerprintFactory`, whose default mode is `safe`.
- Contract violated: `packages/winglet/common-utils/src/utils/object/fingerprint/DETAIL.md:13` says the safe key compares the contents of plain objects and arrays and the values of `Date` and `RegExp`. The same package's `isPlainObject` classifies the foreign object as plain, which the probe asserts.
- Root cause: `packages/winglet/common-utils/src/utils/object/fingerprint/utils/createSafeWriter.ts:46` checks `prototype === Date.prototype`, and `createSafeWriter.ts:50` gives a reference identity to any object whose prototype is not this realm's `Object.prototype`. A plain object or `Date` from another realm therefore receives an opaque `@N` key.
- Relation to earlier rounds: Sibling of `../round-2/winglet-common-utils.md` item 7 (values from another realm); the round 2 known limit covers only `isEmpty`.
- Reopens an earlier fix: No. `git log -L` shows only `8877b1eb8`.
- Reproduction: `realm.test.ts`. "a foreign plain object is fingerprinted by content like a local one" returns `'@0'` where `'{1:b[1,2]|1:a1}'` is expected. "a foreign Date is fingerprinted by value" returns `'@1'` where `'Date(5)'` is expected.
- Confidence: high; public API, with values created through `node:vm`.

## 14. `Murmur3` throws `TypeError` for a `Uint8Array` or `ArrayBuffer` from another realm.

- Severity: low. Bytes that come from an iframe or a `vm` context cannot be hashed.
- Affected public API: `Murmur3#hash`, `Murmur3.hash` and the `Murmur3` constructor.
- Contract violated: `packages/winglet/common-utils/src/utils/hash/DETAIL.md:13` says `hash` throws `TypeError` only when the input is not a string, `ArrayBuffer` or `Uint8Array`, and the public types accept these values.
- Root cause: `packages/winglet/common-utils/src/utils/hash/murmur3.ts:109` and `:111` check the input with `instanceof ArrayBuffer` and `instanceof Uint8Array`, which are false for objects from another realm, so the input falls through to the `TypeError` branch.
- Relation to earlier rounds: Sibling of `../round-2/winglet-common-utils.md` item 7.
- Reopens an earlier fix: No.
- Reproduction: `realm.test.ts`. "a foreign Uint8Array hashes like a local one" and "a foreign ArrayBuffer hashes like a local one" throw "Murmur3.hash: 'input' must be a string, ArrayBuffer, or Uint8Array" where the hashes of the same local bytes (2727459272 and 1232255769) are expected.
- Confidence: high; public API, with values created through `node:vm`.

## 15. A call made from inside `beforeExecute` bypasses `preventConcurrent` and runs the original function concurrently.

- Severity: low. The trigger is narrow, for example a `beforeExecute` that blurs the focused field whose blur handler autosaves through the same handler; when it happens, the original function runs twice at once under the default `preventConcurrent: true`.
- Affected public API: `getTrackableHandler`.
- Contract violated: `packages/winglet/common-utils/src/utils/function/enhance/getTrackableHandler/DETAIL.md`, acceptance group concurrent-guard, says that with `preventConcurrent` set to `true` an extra call made while the first is running does not run the original function and returns `undefined`.
- Root cause: `packages/winglet/common-utils/src/utils/function/enhance/getTrackableHandler/getTrackableHandler.ts:414` checks `pending`, but `pending = true` at `getTrackableHandler.ts:430` runs only after `beforeExecute` at `getTrackableHandler.ts:419`, so a call that re-enters from the hook passes the check. The inner call's `finally` also resets `hookRunning`, so state updates made later in the outer hook are no longer folded into one notification.
- Relation to earlier rounds: New class.
- Reopens an earlier fix: No.
- Reproduction: `trackable.test.ts`, "a call made from beforeExecute does not run concurrently under preventConcurrent". Maximum concurrent runs: actual 2, expected 1.
- Confidence: high for the behavior and low for how often real applications reach it; public API.

## Hypotheses checked and not bugs

- From `r3-contracts`:
  - No package uses `instanceof` on another package's copy of the `@winglet/common-utils` error classes, so two copies of the package cannot misclassify those errors across packages.
  - The stale `knowledge/corrections.md:39` description of `at(array, 1.7)` (the code now truncates and returns the element, and the return type includes `undefined`) only adds needless caution, so it is not reported.
  - Helper candidates judged not to change what a consumer does: the `withTimeout` timer warning (`knowledge/corrections.md:11`), the `hasUndefined` cycle warning (`knowledge/semantics.md:94-96`), `sortWithReference` returning a copy (`knowledge/semantics.md:103`), the described outcome of reversed `waitAndExecute` arguments (`knowledge/corrections.md:17`, the stated signature is correct), the `scheduleNextTick` ordering statement (`knowledge/semantics.md:135`, rarely relied on), the `forEach` early break and the `cloneLite` prototype wording. The `getTrackableHandler` notification claims (`SKILL.md:39`, `knowledge/semantics.md:174` and `:180`) belong to `r3-common-utils`'s area.
- From `r3-common-utils`:
  - `Murmur3` incremental byte hashing matches a reference MurmurHash3 x86_32 implementation in 3,000 seeded cases with random split points, byte offsets 0 to 7, the aligned `DataView` path, mixed `ArrayBuffer` and `Uint8Array` pieces, and `result()` calls in between.
  - `Murmur3` incremental string hashing matches the one-shot hash in 3,000 seeded cases that mix surrogate pairs, code units 0xFF, 0x100, 0x8000 and 0xFFFF, and Hangul at every split, so the round 2 item 3 fix holds.
  - `Murmur3` seeded through the constructor equals `Murmur3` seeded through `reset`.
  - `equals` and `stableEquals` tell `Map` and `Date` values from another realm apart by content, `cloneLite` copies a foreign `Map`, `Date` and `Set` into usable values, `merge` merges a foreign plain source deeply, and `clone` copies a foreign `Uint8Array` correctly.
  - `stringifyGraph` either encodes a foreign plain object or rejects it with `TypeError`; it never returns a silently wrong result.
  - `debounce` called after `clear()` runs once after the wait.
  - With real timers in Node, a trailing-only `throttle` fed by a `setInterval` of the same period delivered the final value in all eight trials, because the interval callback runs before the throttle timer.
  - `getTrackableHandler` blocks a second call in the same tick, because `pending` is set synchronously, and it cleans up after a synchronous throw from the original function.
  - Checked by reading the code only: the `factorial` and `fibonacci` caches never store a failure; the immutable cache of `createFingerprintFactory` stores only completed root results; `semantics.md` documents that the identifier `scheduleMacrotask` returns in Node is an `Immediate` object; the `instanceof`-only error guards are a decision recorded under Never do in `packages/winglet/common-utils/src/errors/INTENT.md`; a `debounce` or `throttle` wrapper used after `dispose()` no longer reacts to its signal, which is use after disposal and was not reported.

## Open leads

- From `r3-common-utils`:
  - The `MessageChannelScheduler` fallback in a host without `setImmediate` but with a ref-counted `MessagePort` may keep the event loop alive once `onmessage` is set; this was not tested in such a host.
