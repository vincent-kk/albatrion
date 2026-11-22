# @winglet/common-utils: bug bounty round 4

This round confirmed 12 new findings in `@winglet/common-utils`: 2 medium and 10 low. Items in the earlier round documents ([round 1](../round-1/winglet-common-utils.md), [round 2](../round-2/winglet-common-utils.md), [round 3](../round-3/winglet-common-utils.md)) were treated as fixed and excluded. The main session re-ran every probe: the `r4-common-utils` folder ran 57 tests, of which 37 fail and 20 pass, and the `r4-contracts` folder ran 4 tests, of which 3 fail and 1 control passes. Verification limits are listed under the probes.

Probes: [probes/winglet-common-utils/](probes/winglet-common-utils/)

- From `r4-common-utils`:
  - Probe folder in the working tree: `packages/winglet/common-utils/src/__bounty__/r4-common-utils/`; the round copy is `bug-bounty/round-4/probes/winglet-common-utils/r4-common-utils/`.
  - To run the copy: copy it back to `packages/winglet/common-utils/src/__bounty__/r4-common-utils/` and run `yarn workspace @winglet/common-utils test --run src/__bounty__/r4-common-utils`. A single file runs with the file path added to that directory, and a single test with `-t "<test name>"` added.
  - Failing tests that are not findings:
    - `clone.test.ts`, "a typed array view keeps aliasing with its buffer inside one clone" and "a DataView keeps its byteOffset into its own buffer": diagnostic. `clone` copies each view's bytes into a buffer of its own, so a view and the buffer it shared in the original no longer alias in the clone. The `clone` contract does not promise that sharing, and lodash `cloneDeep` breaks it too, so it is not reported.
    - `schedulerOrder.test.ts`, "two tasks queued together see the same microtask order as two tasks queued apart (browser path)": diagnostic. It shows the documented batching of synchronously scheduled tasks and supports item 10.
    - `console.test.ts`, "a message line containing \"%%\" keeps both percent signs": diagnostic. The Node formatter collapses `%%`, while the WHATWG Console Standard does not define `%%`, so the result depends on the host.
    - `rateLimitDifferential.test.ts`, "agree on 3000 seeded pairs of plain JSON objects": rejected hypothesis. `merge` differs from lodash `merge` only where the target is an array and the source is a plain object; `merge` replaces the array by its documented rule, while lodash writes the keys onto the array.
    - `rateLimitDifferential.test.ts`, "classifies differences over 300 seeded schedules (leading and trailing)": measurement. `throttle` differs from lodash `throttle` in 153 of 300 schedules, always with at most two runs in any 100 millisecond interval, which is the trailing run followed by a leading run that round 1 accepted. It shows no regression of round 3 item 1.
  - Control tests that pass:
    - `clone.test.ts`: "control: stableEquals(error, clone(error)) is true", "control: a foreign Error with a cause keeps cause non-enumerable", "control: a plain class instance keeps its prototype" and "control: an Error subclass keeps its prototype".
    - `math.test.ts`: "control: an ASCII lowercase digit is accepted case-insensitively", "control: parseInt rejects the same non-ASCII characters" and "control: below 2^53 the warmed and fresh results agree".
    - `schedulerOrder.test.ts`: "browser path (MessageChannelScheduler) matches the documented final order".
    - `objectShape.test.ts`: "control: a local DataView is not a typed array" and "control: a foreign Uint8Array is a typed array".
    - `console.test.ts`: "control: plain text and details are printed".
    - `trackable.test.ts`: "control: beforeExecute under preventConcurrent (nested call blocked) notifies twice", "control: without a nested call the two writes reach subscribers together" and "no hooks, guarded hooks and concurrent hooks give the same result".
    - `rateLimitDifferential.test.ts`: the three `debounce` tests "same invocations for … over 300 seeded schedules", which match lodash `debounce` for every combination of `leading` and `trailing`, and "agree with lodash on 5000 seeded pairs (including near-copies)" for `equals` and `stableEquals`.
    - `schedulerIdentity.test.ts`: "control: an id cancels its own task".
    - `cycleDocs.test.ts`: "control: merge with a cyclic source overflows the stack as documented".
  - Verification limits: every probe imports the package through its own Vitest alias `@/common-utils`, which points to `src`; no `dist` build and no other workspace package is used. Values from another realm come from `node:vm` `runInNewContext`, and no iframe was tested. The browser scheduler path is reached by deleting `setImmediate` and `clearImmediate` and using Node's global `MessageChannel`. Console output is rendered with `node:util` `format`. The cycle probes run each call under a `node:vm` watchdog, so a call that never ends is reported as "did not finish" instead of stopping the run.
- From `r4-contracts`:
  - Probe folder in the working tree: `packages/winglet/common-utils/src/__bounty__/r4-contracts/`; the round copy is `bug-bounty/round-4/probes/winglet-common-utils/r4-contracts/`.
  - To run the copy: copy it back to `packages/winglet/common-utils/src/__bounty__/r4-contracts/` and run `yarn workspace @winglet/common-utils test --run src/__bounty__/r4-contracts/documentedImports.test.ts`. No probe-local configuration is needed.
  - Failing tests that are not findings: none. The three failing tests reproduce item 12.
  - Control tests that pass: "control: the chunk function the example means exists on the array subpath".
  - Verification limits: the probe checks every named import in the README code blocks against the `src` file that the subpath's `source` export condition names; no `dist` is read. It skips `someUtility` at `packages/winglet/common-utils/README.md:34`, an obvious placeholder.

Root-cause files: `packages/winglet/common-utils/src/utils/` for items 1 to 11; the package READMEs `packages/winglet/common-utils/README.md` and `packages/winglet/common-utils/README-ko_kr.md` for item 12.

## 1. `clone` of a subclass of `Map`, `Set`, `Date`, `RegExp` or `Array` returns an instance of the base class, so the subclass's methods and overrides are lost.

- Severity: medium. The values are silently wrong: a `DefaultMap` subclass whose `get` returns a default value answers `undefined` on the clone, and a method that the subclass adds throws `TypeError` on the clone. An application that deep-copies state holding a registry, a least-recently-used cache or a default map built on these classes gets a plain built-in whose behavior differs from the original.
- Affected public API: `clone` (package root and the `object` subpath).
- Contract violated:
  - `packages/winglet/common-utils/src/utils/object/clone.ts:182` promises "Prototype Preservation: Maintains original prototype chains", `clone.ts:178` lists custom objects as supported, and `clone.ts:43` promises a clone "with identical structure and values".
  - `packages/winglet/common-utils/docs/agents/skills/common-utils-skill/knowledge/semantics.md:35` says the prototype chain is preserved by `clone`.
- Root cause:
  - The branches that test `instanceof` build instances of the base class: `clone.ts:266-267` (`new Array`), `clone.ts:282-283` (`new Date`), `clone.ts:288-289` (`new RegExp`), `clone.ts:295-296` (`new Map()`) and `clone.ts:306-307` (`new Set()`).
  - Other values keep their prototype: the `Error` branch constructs through `value.constructor`, typed arrays copy through `slice`, which respects the species constructor, and plain class instances are created with `Object.create(prototype)`. A subclass is therefore handled two different ways depending on which built-in it extends.
- Relation to earlier rounds: Sibling of [round 1 item 4](../round-1/winglet-common-utils.md), in which `clone` built a broken copy of a built-in; same function, different mechanism. `clone` across realms is on the second-round watch list, but this item is not about realms.
- Reopens an earlier fix: No. `git log -L 260,310` shows `a925ee17e` (round 3 item 5), which added only the path for values from another realm; the remaining lines predate the bug bounty (`26448a8f1`, `d5b330ca5`, `0c9f68cba`).
- Reproduction: `packages/winglet/common-utils/src/__bounty__/r4-common-utils/clone.test.ts`.
  - "a Map subclass instance clones into the same subclass": the prototype of the clone is `Map.prototype`; expected `Registry.prototype`. The failure message shows a `TypeError` that Vitest raises while it prints `Map.prototype`.
  - "a Date subclass instance clones into the same subclass": `Date.prototype`; expected `Day.prototype`.
  - "a Array subclass instance clones into the same subclass", "a Set subclass instance clones into the same subclass" and "a RegExp subclass instance clones into the same subclass": the prototypes differ (`false`); expected `true`.
  - "a subclass method still works on the clone (DefaultMap)": `clone(counts).get('missing')` returns `undefined`; expected `0`.
- Confidence: high for the behavior and medium for the classification. The round 3 known limit excludes arbitrary constructors and prototype tampering; a standard `extends Map` subclass is neither, and `clone` calls no constructor for it. Public API, run through the package source.

## 2. `clone` of a local `Error` that has a `cause` makes `cause` an enumerable own property, so `equals(error, clone(error))` is `false` and the clone's JSON differs from the original's.

- Severity: medium. Cloning state that holds an ES2022 error with a cause breaks the round trip with the package's own comparison: change detection built on `equals` always reports a change, and `JSON.stringify` or an object spread of the clone shows a `cause` key that the original does not have. The same error created in another realm clones correctly.
- Affected public API: `clone` (package root and the `object` subpath); the symptom is visible through `equals`.
- Contract violated:
  - `packages/winglet/common-utils/src/utils/object/equals/equals.ts:220` says `equals` does not compare non-enumerable properties, and `packages/winglet/common-utils/src/utils/object/equals/DETAIL.md:21` says `equals` does not observe `stack` and `cause`. The clone turns a slot that `equals` ignores into a key that it compares.
  - `packages/winglet/common-utils/src/utils/object/clone.ts:43` promises a clone with identical structure.
  - For an error from another realm, `clone.ts:424-426` defines `cause` as non-enumerable, so equivalent inputs from two realms clone into different shapes.
- Root cause: `packages/winglet/common-utils/src/utils/object/clone.ts:399-401` runs `if ('cause' in value) result.cause = replicate(...)`. The error that `clone` constructs has no own `cause`, so the assignment creates a new enumerable property. The path for errors from another realm (`clone.ts:424-426`) and the local `AggregateError` path for `errors` both use `defineProperty`, which keeps the property non-enumerable.
- Relation to earlier rounds: Sibling of [round 3 item 5](../round-3/winglet-common-utils.md), whose fix made the path for other realms correct and left the local path out, and of [round 1 item 4](../round-1/winglet-common-utils.md). The neighboring lines for `errors` come from the round 1 item 4 fix (`983ad29ae`).
- Reopens an earlier fix: No. `git log -L 399,401` shows only `d5b330ca5`, `452106d94` and `26448a8f1`.
- Reproduction: `packages/winglet/common-utils/src/__bounty__/r4-common-utils/clone.test.ts`.
  - "a local Error with a cause clones with the same enumerable keys": `Object.keys` of the clone is `['cause']`; expected `[]`.
  - "equals(error, clone(error)) is true for a local Error with a cause": `false`; expected `true`.
  - "a local and a foreign Error with the same cause clone to the same property shape": the local clone has an enumerable `cause` and the foreign clone a non-enumerable one; expected the same shape.
  - "JSON of a cloned local Error equals JSON of the original": `'{"cause":"disk full"}'`; expected `'{}'`.
- Confidence: high; public API, run through the package source.

## 3. With `preventConcurrent: false`, a call made from inside `beforeExecute` or `afterExecute` clears the shared hook flag, so the outer hook's later state writes publish on their own and two calls produce five notifications instead of four.

- Severity: low. The trigger is narrow: a hook that calls the same handler, for example the round 3 item 15 case of a hook that blurs a field whose blur handler saves through the same handler, under the non-default option `preventConcurrent: false`. When it happens, subscribers such as a user interface receive an extra notification that shows the outer hook's state half written.
- Affected public API: `getTrackableHandler` with `preventConcurrent: false` and a `beforeExecute` or `afterExecute` hook.
- Contract violated:
  - `packages/winglet/common-utils/src/utils/function/enhance/getTrackableHandler/DETAIL.md:8` says every call notifies each subscriber exactly twice, at start and at completion.
  - `getTrackableHandler/DETAIL.md:26` says state writes made during a hook fold into the one notification at the end of the hook.
  - `packages/winglet/common-utils/docs/agents/skills/common-utils-skill/knowledge/semantics.md:178` says hook state writes are batched into lifecycle notifications.
- Root cause: `packages/winglet/common-utils/src/utils/function/enhance/getTrackableHandler/getTrackableHandler.ts:376` keeps one `hookRunning` flag for all calls. In the hook path that allows concurrent calls, the nested call sets the flag at `getTrackableHandler.ts:523` and clears it in `finally` at `getTrackableHandler.ts:534`, or at `getTrackableHandler.ts:547` after `afterExecute`, while the outer hook is still running. The outer hook's next `update` then sees the flag cleared at `getTrackableHandler.ts:403` and publishes at once. Under `preventConcurrent: true` the nested call is blocked by `pending`, so only the concurrent path keeps this mechanism.
- Relation to earlier rounds: Same mechanism as [round 3 item 15](../round-3/winglet-common-utils.md), in which the inner call's `finally` also reset `hookRunning`. The `getTrackableHandler` hooks are on the second-round watch list, and this is the third round in which the same function and class appear.
- Reopens an earlier fix: Round 3 item 15, fix `020ebd94c` ("await lifecycle hooks without slowing sync calls", which carries items 2 and 15). That fix blocked re-entry only in the path that prevents concurrent calls. `git log -L 520,553` shows `020ebd94c`, `13f226cd6` and `2f850c670`.
- Reproduction: `packages/winglet/common-utils/src/__bounty__/r4-common-utils/trackable.test.ts`.
  - "beforeExecute, concurrent calls allowed: two calls notify four times": 5 notifications; expected 4.
  - "afterExecute, concurrent calls allowed: two calls notify four times": 5 notifications; expected 4.
- Confidence: high for the behavior and low for how often applications reach it; public API, run through the package source.

## 4. `equals` and `cloneLite` never finish on a cyclic input whose two sides have the same shape, while the `equals` JSDoc and the packaged knowledge promise a `RangeError`; the JSDoc's own cyclic example returns `false`.

- Severity: low. The defect is mainly in the documents, but its consequence is a hang: a developer or agent who relies on the documented fail-fast `RangeError`, for example inside a `try`/`catch` guard, freezes the process on cyclic data instead of catching an error.
- Affected public API: `equals` and `cloneLite` (package root and the `object` subpath), and their packaged knowledge.
- Contract violated:
  - `packages/winglet/common-utils/src/utils/object/equals/equals.ts:163-170` warns that circular references cause a stack overflow and shows `equals(circular1, circular2)` crashing with `RangeError: Maximum call stack size exceeded`. `equals.ts:216` in the same JSDoc says the comparison does not terminate, so the file contradicts itself.
  - `packages/winglet/common-utils/docs/agents/skills/common-utils-skill/SKILL.md:15` says `cloneLite` and `equals` overflow the stack.
  - `packages/winglet/common-utils/docs/agents/skills/common-utils-skill/knowledge/semantics.md:11` and `:34` say the same, and `semantics.md:94-96` lists both functions as "recursion, so a cycle overflows the stack", apart from the functions that "spin forever", which it calls the worse failure.
- Root cause:
  - The round 2 depth fix rewrote `equals` as a loop over an explicit work stack (`packages/winglet/common-utils/src/utils/object/equals/utils/equalsRecursive.ts`, the `while (pending.length)` loop, commit `83590aa76`). The loop keeps no record of visited pairs, so two isomorphic cycles push the same pair forever.
  - The same fix moved `cloneLite` to work frames past depth 256 (`packages/winglet/common-utils/src/utils/object/cloneLite/utils/replicateDeep.ts`, commit `2d26d20f7`), which also never end on a cycle.
  - The fix updated `equals.ts:216` but not the example at `equals.ts:163-170` or the packaged knowledge; `git log -L 160,172` on `equals.ts` shows only `9506d1294`, `89e881f66` and `4c9a03870`.
- Relation to earlier rounds: Same class as the round 3 documents that a fix did not update (`@winglet/style-utils` item 8 and `@winglet/react-utils` item 6 in [round 3](../round-3/README.md)). In round 3 the hunter `r3-contracts` set aside the `hasUndefined` row of the same table because it only adds caution; these rows err in the dangerous direction. A related symptom in another package has its own root cause: [canard-schema-form item 7](canard-schema-form.md), in which the context comparator hangs on cycles.
- Reopens an earlier fix: [Round 2 `@winglet/json` item 7](../round-2/winglet-json.md), commits `83590aa76` (`equals`) and `2d26d20f7` (`cloneLite`). The depth fix changed the behavior on cycles from a stack overflow to a loop that never ends and left the documents that promise the overflow.
- Reproduction: `packages/winglet/common-utils/src/__bounty__/r4-common-utils/cycleDocs.test.ts`. Each call runs under a `node:vm` watchdog.
  - "equals on two cyclic objects overflows the stack as documented": did not finish within 500 milliseconds; expected a stack overflow.
  - "equals on two isomorphic mutual cycles throws RangeError as the JSDoc example says": did not finish within 500 milliseconds; expected a stack overflow.
  - "the equals JSDoc example (two objects referencing each other) throws RangeError": returned `false`, because the two objects have different names; expected a stack overflow.
  - "cloneLite on a cyclic object overflows the stack as documented": did not finish within 100 milliseconds; expected a stack overflow.
- Confidence: high; public API, run through the package source.

## 5. A task id issued before `destroyGlobalScheduler()` or `destroy()` cancels an unrelated task scheduled later, because every scheduler instance numbers its tasks from 1.

- Severity: low. It needs a scheduler teardown, which `destroyGlobalScheduler()` documents for test teardown and which the public `destroy()` allows at any time. When it happens, a task is silently lost: in a browser, a stale `cancelMacrotask(id)`, or the cancel function of `scheduleCancelableMacrotask` captured before the teardown, cancels a newly scheduled task, for example a validation frame of `@canard/schema-form`, which then never runs.
- Affected public API: `MessageChannelScheduler#cancel` and `clearImmediate`, and in browsers `cancelMacrotask` and `scheduleCancelableMacrotask`, which fall back to these functions (`packages/winglet/common-utils/src/utils/scheduler/scheduleMacrotask.ts:81-82`).
- Contract violated:
  - `packages/winglet/common-utils/src/utils/scheduler/scheduleMacrotask.ts:293` says cancellation is safe to call with the same id more than once or with an invalid id.
  - The acceptance group global-handler-delegation in `packages/winglet/common-utils/src/utils/scheduler/MessageChannelScheduler/DETAIL.md` says the global functions behave like the instance methods, under which a cancelled task does not run and other tasks do.
- Root cause: `packages/winglet/common-utils/src/utils/scheduler/MessageChannelScheduler/MessageChannelScheduler.ts:117` declares `__taskIdCounter__` as an instance field, and `MessageChannelScheduler.ts:184` issues ids from 1 in every new instance. `packages/winglet/common-utils/src/utils/scheduler/MessageChannelScheduler/handler.ts:138` forwards any id to the current instance, creating one if needed, so an id from a destroyed instance names a task of the new one.
- Relation to earlier rounds: Same class as round 3 class 26, errors that vanish or state that sticks across lifecycles ([round 3](../round-3/README.md)); new function.
- Reopens an earlier fix: No. `git log -L` on the counter line shows only `77990abd8`.
- Reproduction: `packages/winglet/common-utils/src/__bounty__/r4-common-utils/schedulerIdentity.test.ts`.
  - "clearImmediate with an id issued before destroyGlobalScheduler leaves the new task alone": `{ cancelled: true, ran: [] }`; expected `{ cancelled: false, ran: ['new'] }`.
  - "cancel on a new instance with an id from a destroyed instance returns false": `{ cancelled: true, ran: [] }`; expected `{ cancelled: false, ran: ['new'] }`.
- Confidence: high; public API on Node's global `MessageChannel`. The browser wrapper path is established by reading `scheduleMacrotask.ts:81-82`.

## 6. `shallowClone` and `removeUndefined` turn a prototype-free dictionary into an ordinary object, so `copy.constructor` and other `Object.prototype` names resolve to inherited members.

- Severity: low. It affects dictionaries made with `Object.create(null)` or with this package's `getEmptyObject()`. A lookup by a user key such as `constructor` or `toString` on the copy returns an inherited function instead of `undefined`.
- Affected public API: `shallowClone` and `removeUndefined` (package root and the `object` subpath).
- Contract violated:
  - `packages/winglet/common-utils/docs/agents/skills/common-utils-skill/knowledge/semantics.md:35` says `shallowClone` preserves the prototype chain through the spread.
  - `clone` and `cloneLite` keep the null prototype for the same input, so equivalent copy functions disagree.
- Root cause:
  - `packages/winglet/common-utils/src/utils/object/shallowClone.ts:278` returns `{ ...value }`, and an object spread always creates an object whose prototype is `Object.prototype`.
  - `packages/winglet/common-utils/src/utils/object/removeUndefined.ts:307` builds the result as `{}` for every input that `isPlainObject` accepts, and `isPlainObject` accepts null-prototype objects.
- Relation to earlier rounds: Same class as round 3 class 24, lookups that read inherited prototype keys from a plain object ([round 3](../round-3/README.md)). Sibling of [round 2 item 1](../round-2/winglet-common-utils.md), which concerned the copy semantics of `removeUndefined` for a different input, an own `__proto__` key.
- Reopens an earlier fix: No. The `shallowClone` line comes from `d8fac9049`. The `removeUndefined` line was last touched by `ce71fc9f5`, the round 2 fix for the own `__proto__` key, which did not concern the prototype of the result.
- Reproduction: `packages/winglet/common-utils/src/__bounty__/r4-common-utils/objectShape.test.ts`.
  - "shallowClone keeps a null prototype like clone and cloneLite do": the prototype of the shallow copy is `Object.prototype`; expected `null`, as for `clone` and `cloneLite`.
  - "a key lookup on the shallow copy finds nothing for an absent \"constructor\" key": `[Function Object]`; expected `undefined`.
  - "removeUndefined keeps a null prototype": `Object.prototype`; expected `null`.
- Confidence: high; public API, run through the package source.

## 7. `printWarning` and `printError` put the title and the message lines into the console format string, so `%o`, `%s`, `%d` or `%c` in the text is expanded, the text changes and the `details` object is consumed.

- Severity: low. The effect is limited to console output. A development warning of `@canard/schema-form` (its `warnDevelopmentIssue` helper calls `printWarning`) whose message carries user text containing `%` prints a mangled line and loses its details object.
- Affected public API: `printWarning` and `printError` (package root and the `console` subpath).
- Contract violated:
  - `packages/winglet/common-utils/src/utils/console/printWarning.ts:7-8` and `packages/winglet/common-utils/src/utils/console/printError.ts:7-8` describe the parameters as the title and the message lines to print.
  - The Formatter of the WHATWG Console Standard (https://console.spec.whatwg.org/#formatter) expands format specifiers in the first argument, so the text must not be placed there unescaped.
- Root cause: `packages/winglet/common-utils/src/utils/console/printError.ts:18-19` and `packages/winglet/common-utils/src/utils/console/printWarning.ts:18-19` interpolate `title` and each line into the first argument without escaping `%`. Each specifier in the text consumes one of the style arguments or the `details` argument.
- Relation to earlier rounds: Same class as round 3 class 28, scanners that ignore escapes or token boundaries ([round 3](../round-3/README.md)); new function.
- Reopens an earlier fix: No. `git log -L` on the format lines shows only `dc3f58499`.
- Reproduction: `packages/winglet/common-utils/src/__bounty__/r4-common-utils/console.test.ts`, with the arguments rendered by `node:util` `format`.
  - "a title containing \"%o\" is printed as written": the title prints as `Discount must be 100'color: #d97706'ff or less`; expected `Discount must be 100%off or less`.
  - "a message line containing \"%s\" is printed as written and details still follow": the line prints as `pattern "{ path: '/a' }" is not allowed`, with the details substituted into it; expected the line as written followed by the details.
- Confidence: high; public API, run through the package source with the Node formatter.

## 8. `fromBase` accepts letters outside ASCII whose uppercase form is an ASCII letter: `fromBase('ı', 36)` is 18, `fromBase('ſ', 36)` is 28, `fromBase('ß', 36)` is 1036 and `fromBase('ﬀ', 16)` is 255.

- Severity: low. Untrusted input that should be rejected parses to a number, so validation that relies on `fromBase` throwing accepts characters that only look like digits.
- Affected public API: `fromBase` (package root and the `math` subpath).
- Contract violated:
  - `packages/winglet/common-utils/src/utils/math/fromBase.ts:13` says `fromBase` throws when it finds invalid digits, and `fromBase.ts:58` names converting user input as a use case.
  - `packages/winglet/common-utils/src/utils/math/DETAIL.md:35` says invalid digits throw.
- Root cause: `packages/winglet/common-utils/src/utils/math/fromBase.ts:76` calls `cleanValue.toUpperCase()`, which applies full Unicode case mapping (`ı` to `I`, `ſ` to `S`, `ß` to `SS`, `ﬀ` to `FF`, so the length can change) before the ASCII digit lookup at `fromBase.ts:80`.
- Relation to earlier rounds: Sibling of [round 2 item 8](../round-2/winglet-common-utils.md), in which `fromBase` also accepted an invalid input, and of the round 2 class of spelling variants such as letter case ([round 2](../round-2/README.md)).
- Reopens an earlier fix: No. The line comes from `c2949646a`; the round 2 fix commits `f7b52b932` and `fed3f7874` changed only the sign check.
- Reproduction: `packages/winglet/common-utils/src/__bounty__/r4-common-utils/math.test.ts`, the four tests "fromBase(%j, %i) throws an invalid-digit error": they return 18, 28, 1036 and 255; expected an invalid-digit error.
- Confidence: high; public API, run through the package source.

## 9. `factorial` returns different values for the same `n` above 2^53, depending on which smaller factorials the process computed earlier.

- Severity: low. The difference is one unit in the last place, but the result is not deterministic, and the path without a cache is the less accurate one: `factorial(25)` returns `1.5511210043330984e+25` in a fresh process and `1.5511210043330986e+25`, the correctly rounded value, after `factorial(24)`. The same call therefore gives different results across code paths or processes, which breaks snapshot tests and equality of derived values.
- Affected public API: `factorial` (package root and the `math` subpath).
- Contract violated: `packages/winglet/common-utils/src/utils/math/factorial.ts:7` and `factorial.ts:35` describe the cache as reuse of earlier results for speed, which must not change the result; equal calls must give equal results.
- Root cause: `packages/winglet/common-utils/src/utils/math/factorial.ts:65-66` multiplies the descending product by the first cached factorial it meets. Floating-point multiplication is not associative above 2^53, so the contents of the cache change the rounding, and `factorial.ts:71` caches that result for later calls.
- Relation to earlier rounds: Same class as the round 1 class of lazy indexing that makes results depend on order ([round 1](../round-1/README.md)).
- Reopens an earlier fix: No. The lines come from `c2949646a`.
- Reproduction: `packages/winglet/common-utils/src/__bounty__/r4-common-utils/math.test.ts`, with a fresh module cache for each computation.
  - "factorial(25) is the same with and without factorial(24) computed first": `1.5511210043330986e+25` after `factorial(24)`; expected `1.5511210043330984e+25`, the value without it.
  - "every n from 20 to 170 gives one value whatever smaller n was computed first": the values for 25, 26, 27, 28 and 30 differ; expected no difference.
- Confidence: high. The probe loads the `factorial` module that the package root re-exports directly from source, so that each computation starts with an empty cache.

## 10. The documented order of `scheduleMacrotask` holds only on the browser path; in Node, a microtask queued by the first task runs before the second task.

- Severity: low. Code ordered by the documented example behaves differently in Node, for example in tests and server rendering, than in a browser.
- Affected public API: `scheduleMacrotask` and `scheduleCancelableMacrotask` (package root and the `scheduler` subpath).
- Contract violated: `packages/winglet/common-utils/src/utils/scheduler/scheduleMacrotask.ts:248` gives the final order `['sync-1', 'sync-2', 'microtask-1', 'macrotask-1', 'macrotask-2', 'nested-microtask', 'nested-macrotask']`, and `scheduleMacrotask.ts:283` promises predictable execution across environments.
- Root cause: `packages/winglet/common-utils/src/utils/scheduler/scheduleMacrotask.ts:77` binds the native `setImmediate` in Node, which runs a microtask checkpoint after each callback. The browser fallback runs every task scheduled in the same synchronous context inside one message (`packages/winglet/common-utils/src/utils/scheduler/MessageChannelScheduler/MessageChannelScheduler.ts:299`), with no checkpoint between the tasks. The same calls therefore produce different orders on the two hosts.
- Relation to earlier rounds: Sibling of [round 3 item 4](../round-3/winglet-common-utils.md), in which the same wrapper gave different results in Node and in a browser, and of the class of documented examples that do not match the code.
- Reopens an earlier fix: No.
- Reproduction: `packages/winglet/common-utils/src/__bounty__/r4-common-utils/schedulerOrder.test.ts`, "Node path (native setImmediate) matches the documented final order": `macrotask-2` runs after `nested-microtask`; expected the documented order. The browser-path control passes.
- Confidence: high. The probe loads the `scheduleMacrotask` module that the package root re-exports directly from source, once for each host path; the browser path is emulated as described under the probes.

## 11. `isTypedArray` returns `true` for a `DataView` from another realm.

- Severity: low. It needs a value from an iframe or a `vm` context. Such a `DataView` is then treated as an indexable typed array.
- Affected public API: `isTypedArray` (package root and the `filter` subpath).
- Contract violated: `packages/winglet/common-utils/src/utils/filter/isTypedArray.ts:29` and `isTypedArray.ts:68` say `DataView` instances are excluded.
- Root cause: `packages/winglet/common-utils/src/utils/filter/isTypedArray.ts:88` excludes `DataView` with a local `instanceof DataView`, which is `false` for a `DataView` from another realm, while `ArrayBuffer.isView` is `true` for it.
- Relation to earlier rounds: Same class as [round 2 item 7](../round-2/winglet-common-utils.md) and [round 3 items 13 and 14](../round-3/winglet-common-utils.md), values from another realm; different function, not on the watch list.
- Reopens an earlier fix: No.
- Reproduction: `packages/winglet/common-utils/src/__bounty__/r4-common-utils/objectShape.test.ts`, "a foreign DataView is not a typed array": `true`; expected `false`.
- Confidence: high; public API, run through the package source, with the value created through `node:vm`.

## 12. The README of `@winglet/common-utils`, in English and Korean, imports `TIME_UNITS` and `TYPE_TAGS` from `@winglet/common-utils/constant` and an `array` namespace from the package root; none of them exists, so the "Using Array Utilities" example throws.

- Severity: low. This is documentation. A reader who copies the examples gets a module link error under native ES modules ("does not provide an export named …"), or, under a bundler that does not check named imports, `TypeError: Cannot read properties of undefined (reading 'chunk')`.
- Affected public API: the `@winglet/common-utils` root and `@winglet/common-utils/constant`.
- Contract violated:
  - `packages/winglet/common-utils/src/index.ts`, the `source` file of the root export, exports no `array` namespace.
  - `packages/winglet/common-utils/src/constant/index.ts`, the `source` file of the `./constant` export, exports neither `TIME_UNITS` nor `TYPE_TAGS`.
  - The `chunk` function that the example means is exported by `@winglet/common-utils/array`.
- Root cause: the README names exports that do not exist, at `packages/winglet/common-utils/README.md:40` (`TIME_UNITS`, `TYPE_TAGS`) and `packages/winglet/common-utils/README.md:352-355` (`array`, then `array.chunk`). The Korean copy `packages/winglet/common-utils/README-ko_kr.md` has them at lines 40 and 345-348.
- Relation to earlier rounds: Same class as [round 3 item 9](../round-3/winglet-common-utils.md), documents that do not match the code (round 3 class 27).
- Reopens an earlier fix: No. `git log -L` on `packages/winglet/common-utils/README.md:40` and `:352-355` shows `5d4f51a43`, `96eff0d0c` and `39b62ebc9`, none of them a bug bounty fix.
- Reproduction: `packages/winglet/common-utils/src/__bounty__/r4-contracts/documentedImports.test.ts`.
  - "every name the English README imports is exported by its subpath": actual `['./constant:TIME_UNITS', './constant:TYPE_TAGS', '.:array']`; expected `[]`.
  - "every name the Korean README imports is exported by its subpath": the same.
  - "the "Using Array Utilities" example runs as written": actual `TypeError: Cannot read properties of undefined (reading 'chunk')`; expected no error.
  - The control "control: the chunk function the example means exists on the array subpath" passes.
- Confidence: high; public API, read through the `src` file that each subpath's `source` condition names.

## Hypotheses checked and not bugs

- `debounce` matches lodash `debounce` on 900 seeded schedules under fake timers, covering the three combinations of `leading` and `trailing`.
- `equals` and `stableEquals` match lodash `isEqual` on 5,000 seeded pairs of JSON data.
- `getTrackableHandler` gives the same outcome, `pending` value and notifications for an origin that throws synchronously on the path without hooks, the guarded hook path and the concurrent hook path, and the code cleans up after hooks that throw or reject.
- `merge` drops an own `__proto__` key in its default mode and keeps it as data when options are passed; `packages/winglet/common-utils/src/utils/object/merge/DETAIL.md:18` records this as a decision.
- `MessageChannelScheduler` ignores the options of later `getInstance` calls and wraps values that are not `Error` objects for `onTaskError`, both documented in `MessageChannelScheduler/DETAIL.md`.
- The synchronous throw of `withTimeout`, the chunked waits and abort handling of `delay`, and the chunked long timers of `debounce` and `throttle` are documented or correct by reading the code.
- `createSafeFingerprint` may key a shared subtree and an equal copy differently, which its `DETAIL.md` allows, and it handles arrays, `Date` and `RegExp` values from another realm.
- `Murmur3` respects the byte offset of a `Uint8Array` from another realm, by reading the code.
- The recursive, frame-based and shallow paths of `cloneLite` produce the same shapes, by reading the code.
- `clone` passes only the message to the constructor of an `Error` subclass whose constructor takes other arguments, as `packages/winglet/common-utils/src/utils/object/DETAIL.md` documents.
- `stableEquals` compares the `stack` of two errors, because it compares every own key through `Reflect.ownKeys`, as documented.
- `BaseError#toJSON` serializes its details with the semantics of `JSON.stringify`, by reading the code.
