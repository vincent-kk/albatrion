# @winglet/common-utils: bug bounty round 5

7 new findings in `@winglet/common-utils`, all low. Items in the documents of [round 1](../round-1/winglet-common-utils.md), [round 2](../round-2/winglet-common-utils.md), [round 3](../round-3/winglet-common-utils.md) and [round 4](../round-4/winglet-common-utils.md) were treated as fixed and excluded, together with the decisions and known limits of each round's `FIXES.md`. The main session re-ran every probe: the `r5-winglet-data` folder ran 67 tests, of which 12 fail; the `r5-rerun-others` folder ran 3 tests, of which 1 fails; the `r5-release` folder ran 3 tests, of which 1 fails. Item 1 is a regression of a round 3 fix and repeats the watch-list point on `getTrackableHandler`; item 2 repeats the watch-list point on `clone` across realms.

Probes: [probes/winglet-common-utils/](probes/winglet-common-utils/)

- Copy a folder back to `packages/winglet/common-utils/src/__bounty__/<hunter-id>/` and run `yarn workspace @winglet/common-utils test --run src/__bounty__/<hunter-id>/`. `r5-winglet-data` imports the package source through the `@/common-utils` alias, and `moduleCopies.r5.test.ts` also loads the ESM and CommonJS `dist`; `r5-release` imports the `dist` by name. `r5-winglet-data/fixtures/trackableBefore020ebd94c.ts` is a transcription of the handler body before `020ebd94c`, used only by item 1's diagnostics.
- Failing tests that are not findings: `r5-winglet-data/cloneRealms.r5.test.ts`, "foreign DataView round-trips like the local one", a decided limit: the clone of a foreign `DataView` is a `DataView` of this realm, and the view families are excluded from prototype preservation (`../round-4/FIXES.md:453`, `src/utils/object/DETAIL.md:102`). The measurement test and the two diagnostics of item 1 pass.
- Earlier probes re-run (`r5-rerun-others`): round 1 ran 14 tests (0 fail), round 2 20 (1 fail), round 3 44 (1 fail), round 4 57 (10 fail; 11 in one of the hunter's runs, because the control "merge with a cyclic source overflows the stack" is flaky); the earlier release probes `r3-contracts` ran 10 (3 fail) and `r4-contracts` 4 (1 fail). Every failure has a recorded role: the round 2 `isEmpty` foreign-realm limit, scheduler errors that go through `reportHostError` and that Vitest records as uncaught (round 3 items 4 and 10), the round 4 cycle decision, the round 4 host-order decision, listed diagnostics and measurements, the round 3 decision to remove `source` only from `publishConfig.exports`, and assertions of text that a documentation fix changed. No earlier item regressed.

Root-cause files: `packages/winglet/common-utils/src/utils/`

## 1. With the default `preventConcurrent: true`, an `update` stored from a finished call is held back while a later call awaits an asynchronous hook, so subscribers see it only when that hook settles.

- Severity: low. It needs two documented patterns together: an update made after a call ends through a stored state manager, as the JSDoc "Advanced lifecycle management" example does from `setTimeout`, and an asynchronous `beforeExecute` or `afterExecute` in a later call, for example one that awaits a confirmation. While that hook is pending, a UI subscribed to the handler shows stale state, such as an old progress phase. The update is delayed, not lost, unless the hook never settles; the same calls with `preventConcurrent: false` publish at once.
- Affected public API: `getTrackableHandler` with `beforeExecute` or `afterExecute` and `preventConcurrent` left at its default.
- Contract violated: `src/utils/function/enhance/getTrackableHandler/INTENT.md:9` and `DETAIL.md:28` (an update function stored outside a hook and called later notifies immediately); the round 4 decision that hook notification ownership is per call (`../round-4/FIXES.md:402`); predictability: the two calls never overlap, so `preventConcurrent` should not change the result.
- Root cause: `getTrackableHandler.ts:377` keeps one `hookRunning` flag for the whole handler, and `:404` publishes an update only while it is `false`. The guarded path sets the flag at `:506` and keeps it across a thenable `beforeExecute` (`:509-510`) until `runOrigin` clears it (`:485`); `complete` does the same for `afterExecute` (`:466`, `:469-470`, cleared by `deliver` at `:454`). Every stored update, including one from an earlier finished call, folds into the current call's hook. The round 4 fix gave only the concurrent path a per-call `HookStateManager`, and `awaitingHookCount` (`:378`) is never incremented.
- Relation to earlier rounds: round 4 item 3 (the same shared flag on the concurrent path) and round 3 item 15.
- Reopens an earlier fix: round 3 items 2 and 15 (`020ebd94c`); round 4 item 3's fix `473b1ffab` repaired the mechanism only for `preventConcurrent: false` and kept the guarded body unchanged.
- Regression of an earlier fix: yes, case (b): round 3 `@winglet/common-utils` item 2, commit `020ebd94c`, which also carries item 15. Before it, hooks were called synchronously and `hookRunning` was cleared before the call continued, so no wait existed in which another call's update could be held back. The diagnostics "before 020ebd94c (hooks not awaited) the guarded path published it at once" run that earlier body and pass.
- Watch list: yes, the redesigned `getTrackableHandler` contract.
- Reproduction: `r5-winglet-data/trackable.r5.test.ts`: "preventConcurrent true publishes it at once while the next call awaits its before hook" records `[]` during the hook, expected `[50]`, the result with `preventConcurrent: false`; "…awaits its after hook" records `[0]`, expected `[0, 50]`. The controls pass.
- Confidence: high for the behavior; medium for how often applications combine the two patterns. Public API from source.

## 2. `clone` of an `Error` from another realm whose `cause` is an enumerable own property makes `cause` non-enumerable, so `equals(error, clone(error))` is `false` and the clone's JSON loses `cause`.

- Severity: low. It needs an error from an iframe or a `vm` context whose cause was assigned (`error.cause = x`) rather than passed through the constructor options. Change detection with `equals` then reports a change, and `JSON.stringify` of the clone drops the `cause` that the original serializes. The same error made locally clones correctly.
- Affected public API: `clone` (the package root and `@winglet/common-utils/object`).
- Contract violated: `src/utils/object/DETAIL.md:34` (an Error's own `cause` is cloned with its original enumerability, with no realm restriction) and `:52` (the clone profile extends to other realms).
- Root cause: `src/utils/object/clone.ts:498-504` defines `cause` and `errors` on the copy of a foreign Error with `defineProperty` and no `enumerable`; `replicateProperties` (`:505`) then assigns into that non-enumerable property. The local path (`:467-474`) reads the enumerability from the original descriptor.
- Relation to earlier rounds: round 4 item 2, whose fix (`66f7557c7`) covered only the local path and whose foreign comparison used a constructor `{ cause }`, non-enumerable on both sides.
- Reopens an earlier fix: round 3 item 5 (`a925ee17e`, `f39d9b183`); `b33b4b968` (round 4 item 1) also touched these lines.
- Regression of an earlier fix: no. `a925ee17e` added the foreign Error copy with this `defineProperty`, but before it `clone` returned a foreign Error by reference, which was itself the defect round 3 item 5 fixed; this input never had a correct clone.
- Watch list: yes, `clone` across realms.
- Reproduction: `r5-winglet-data/cloneSiblings.r5.test.ts`: "a foreign Error with an assigned (enumerable) cause keeps it enumerable" gives `'hidden'`, expected `'enumerable'`; "equals(error, clone(error)) is true for a foreign Error with an assigned cause" gives `false`. The local control passes.
- Confidence: high; public API from source, with the foreign value created through `node:vm`.

## 3. `clone` and `stableEquals` overflow the call stack on deeply nested input that `cloneLite` and `equals` handle, while the `stableEquals` JSDoc promises "no risk of stack overflow with deeply nested circular structures".

- Severity: low. The round 4 cycle decision sends users with cyclic graphs, such as long doubly linked lists, to exactly these two functions. `clone` throws `RangeError` on an acyclic chain of about 1,200 to 1,600 levels, and `stableEquals` on a chain of about 6,000 levels, cyclic or not; `cloneLite` and `equals` finish a chain of 20,000 levels.
- Affected public API: `clone` and `stableEquals`.
- Contract violated: `src/utils/object/equals/utils/stableEquals.ts:27`; `docs/agents/skills/common-utils-skill/knowledge/semantics.md:96` and the `equals` JSDoc, which send cyclic data to these functions; basic correctness for `clone`, which documents no depth limit. Only the maintainer document `equals/DETAIL.md:19` records a limit, and only for deep acyclic input to `stableEquals`.
- Root cause: `clone.ts:262` (`replicate`) recurses through `replicateProperties` without a work-frame fallback, and `stableEquals.ts:324` (`stableEqualsRecursive`) recurses once per level; the round 2 depth fix moved only `equals` and `cloneLite` to explicit work frames.
- Relation to earlier rounds: round 2 `@winglet/json` item 7 and its common-utils depth sibling (round 2 class 7), on functions that fix did not cover.
- Reopens an earlier fix: no; line 27 of `stableEquals.ts` comes from `f5839cd0e`, `89e881f66` and `9506d1294`.
- Regression of an earlier fix: no.
- Watch list: no.
- Reproduction: `r5-winglet-data/cloneSiblings.r5.test.ts`: "clone handles the same 20,000-level acyclic chain as cloneLite", "stableEquals handles the same 20,000-level acyclic chain as equals", "stableEquals does not overflow on a deeply nested circular structure (JSDoc: no risk of stack overflow)" and "clone copies a deeply nested circular structure (the documented choice for cycles)" each give `'RangeError'`, expected `'returned'`. The `cloneLite` and `equals` control passes. The passing measurement test recorded these maximum depths over three runs, which depend on JIT state: `clone` acyclic 1,171 to 1,562, cyclic 1,562 to 5,443; `stableEquals` about 5,990; lodash `cloneDeep` 2,734 to 2,880; `structuredClone` 2,138.
- Confidence: high for the behavior; the 20,000-level tests fail in every run.

## 4. `sortObjectKeys` turns a prototype-free dictionary into an ordinary object, so absent keys such as `constructor` resolve to inherited members.

- Severity: low. It needs an `Object.create(null)` or `getEmptyObject()` dictionary; after sorting, a lookup of a user key such as `constructor` returns a function instead of `undefined`.
- Affected public API: `sortObjectKeys`.
- Contract violated: `src/utils/object/DETAIL.md:11` and `:13` (sibling copy functions keep the null prototype, and `sortObjectKeys` does not change the prototype of its result); `.changeset/prototype-free-copies.md` (absent keys stay absent). `shallowClone`, `removeUndefined`, `clone` and `cloneLite` keep the null prototype for the same input.
- Root cause: `src/utils/object/sortObjectKeys.ts:275` always builds the result as `{}`.
- Relation to earlier rounds: round 4 item 6, whose fix (`477d7f862`) covered only `shallowClone` and `removeUndefined`; round 4 class 37. The `@winglet/json` case is [winglet-json item 1](winglet-json.md).
- Reopens an earlier fix: no; `git log -L 275,275` shows only `e44dcd483` and `ad9fdbc45`.
- Regression of an earlier fix: no.
- Watch list: no.
- Reproduction: `r5-winglet-data/nullPrototype.r5.test.ts`, "sortObjectKeys keeps the null prototype of a prototype-free dictionary": `{ prototype: 'Object.prototype', constructorLookup: 'function' }`, expected `null` and `'undefined'`.
- Confidence: high; public API from source.

## 5. `clone` drops the constructor-set fields of `Map`, `Set`, `Date`, `RegExp` and `Array` subclass instances, while its JSDoc promises identical structure and lists every other subclass limit but this one.

- Severity: low. The behavior is decided and pinned, so the defect is in the consumer-facing documents, but a reader who trusts them gets silently wrong behavior: `class BoundedMap extends Map { constructor(limit) { super(); this.limit = limit; } … }` clones into a map with `limit === undefined` that never evicts, and a subclass with a `#private` field throws on the clone.
- Affected public API: `clone`.
- Contract violated: `clone.ts:43` (`@returns A new deep clone with identical structure and values`) and the "Custom Objects" and "Prototype Preservation" bullets of the same JSDoc; its "Known Limits" block (`clone.ts:196-209`) names the typed-array, `DataView`, `Error`, `ArrayBuffer` and prototype-cache limits but not this one; `docs/agents/skills/common-utils-skill/knowledge/semantics.md:32-35` lists custom prototypes as handled. The omission is recorded only in the maintainer document `src/utils/object/DETAIL.md:29` and `:52` and pinned by `__tests__/helpers/checkBuiltinSubclass.ts`.
- Root cause: `utils/clone/cloneBuiltinSubclass.ts` and `cloneArraySubclass.ts` build the internal slots through `constructBuiltin` without running the constructor body and copy no own properties, while ordinary class instances get their own properties copied (`clone.ts:515`); the JSDoc limits written by the round 4 fix (`c56487980`) leave this case out.
- Relation to earlier rounds: round 4 item 1; round 4 class 39 (documents a fix did not complete).
- Reopens an earlier fix: round 4 item 1, commit `c56487980`.
- Regression of an earlier fix: no; these fields were not copied before round 4 either.
- Watch list: no.
- Reproduction: `r5-winglet-data/cloneSubclassFields.r5.test.ts`: "a Map subclass keeps its constructor-set field, so its overridden method still bounds the map" gives `{ limit: undefined, size: 3 }`, expected `{ limit: 2, size: 2 }`; the JSDoc check "…lists the dropped own properties of built-in subclasses among its known limits" finds no match. The ordinary-class control passes.
- Confidence: high for the behavior; medium for the classification, because the behavior is pinned on purpose and the finding rests on the consumer-facing documents.

## 6. The Korean README calls `isEmpty` a comprehensive check without the foreign-realm limit for `Map` and `Set`.

- Severity: low (a misleading translation of a known limit). A Korean reader passes a populated `Map` or `Set` from an iframe or a `vm` context and gets `true`.
- Affected public API: `isEmpty` (the package root and the `filter` subpath).
- Contract violated: `README.md:191`, `docs/agents/skills/common-utils-skill/knowledge/semantics.md:194` and `src/utils/filter/isEmpty.ts:440`, which state the limit; `DOCUMENTATION.md` principle 4 (a translation changes with its source).
- Root cause: `README-ko_kr.md:184`. The documentation-only fix `9b5994c11` (round 2 item 7) changed `README.md` only, and `cbcc6f997` (round 4 item 12) edited both READMEs but not this line.
- Relation to earlier rounds: round 2 item 7; round 4 class 39.
- Reopens an earlier fix: no; `git log -L 184,184` shows only `1270a6890`.
- Regression of an earlier fix: no.
- Watch list: no.
- Reproduction: `r5-rerun-others/koreanIsEmptyRealm.test.ts`, "the Korean README line states the realm limit for Map and Set" fails; the controls pass (a foreign populated `Map` gives `true`, and the English line states the limit).
- Confidence: high; public API for the behavior, static for the text.

## 7. On Node.js 14, which the README lists as supported, `withTimeout` throws after it has already started the wrapped function, because it constructs a global `AbortController` that Node 14 does not have.

- Severity: low. It needs an end-of-life runtime that the README still names; the caller gets an exception while the wrapped operation keeps running unobserved, so its result and its rejection are lost.
- Affected public API: `withTimeout` (the package root and `@winglet/common-utils/promise`).
- Contract violated: `README.md:106` ("Node.js 14.0.0 or higher").
- Root cause: `src/utils/promise/withTimeout.ts:428` (`dist/utils/promise/withTimeout.mjs:9`) runs `new AbortController()` unconditionally, after `fn()` has run on the line before. `AbortController` became a Node global in 15.0.0, and Node 14.17 provides it only behind a flag. The other host APIs the package uses (`reportError`, `queueMicrotask`, `setImmediate`, `WeakRef`) are feature-guarded.
- Relation to earlier rounds: round 4 class 40 (run-time APIs newer than the documented environment); round 3 item 8 used the same Node 14 contract.
- Reopens an earlier fix: no; `git log -L` on line 428 shows only `0c9f68cba` and `a56a1ae7a`.
- Regression of an earlier fix: no.
- Watch list: no.
- Reproduction: `r5-release/node14WithTimeout.test.ts` removes the global with `vi.stubGlobal` and imports the `dist` by name: "withTimeout settles with the function result where AbortController is not a global" gives `threw TypeError: AbortController is not a constructor` with `started: ['fn']`, expected `'done'`. The controls pass (`delay` without the global, and `withTimeout` with it).
- Confidence: high; built `dist` in an emulated environment.

## Hypotheses checked and not bugs

- `getTrackableHandler`: the plain, guarded and concurrent variants give the same outcome when a subscriber throws on the start notification (the call rejects, the origin does not run, two notifications are sent, `pending` ends `false`); a call restarted from a completion subscriber runs the same way with and without hooks under both `preventConcurrent` values; a hook that starts a nested call and then throws or rejects follows the decided notification counts; with only one hook and a nested call under `preventConcurrent: false`, the handler sends four notifications and ends idle.
- The ESM build, the CommonJS build and the source agree on subclass prototypes in `clone`, the shape of an Error `cause`, the `equals` round trip, trackable notifications, scheduler ids after `destroy` with stale-id cancellation, and the null prototype from `shallowClone`.
- A cross-realm `clone` round-trips like the local one for 14 of 15 value kinds; `DataView` is the decided exception.
- `merge` copies a nested prototype-free source into an ordinary object, as lodash 4.18.1 does.
- Scheduler messages carry task ids, so `cancelAll` and stale messages cannot run a task twice (static).
- Completion-listener errors surface through the host like scheduler errors (round 3 item 10); the flaky merge-cycle control is stack exhaustion, not a swallowed error.
- The published `dist` keeps `publishConfig.exports` without `source`, and the other host APIs the package uses are feature-guarded.
