# @winglet/react-utils: bug bounty round 4

This round confirmed 5 new findings in `@winglet/react-utils`: 2 medium and 3 low. Items in the earlier round documents ([round 1](../round-1/winglet-react-utils.md), [round 2](../round-2/winglet-react-utils.md), [round 3](../round-3/winglet-react-utils.md)) were treated as fixed and excluded. The main session re-ran every probe: the `r4-react-utils-data-loader` folder ran 19 tests, of which 12 fail and 7 pass, and its type probe reports 6 errors; the `r4-contracts` folder ran 5 tests, of which 4 fail and 1 control passes.

Probes: [probes/winglet-react-utils/](probes/winglet-react-utils/)

- From `r4-react-utils-data-loader`:
  - Probe folder in the working tree: `packages/winglet/react-utils/src/__bounty__/r4-react-utils-data-loader/`; the round copy is `bug-bounty/round-4/probes/winglet-react-utils/r4-react-utils-data-loader/`.
  - To run the copy: copy it back to `packages/winglet/react-utils/src/__bounty__/r4-react-utils-data-loader/` and run `yarn workspace @winglet/react-utils test --run --config src/__bounty__/r4-react-utils-data-loader/vitest.config.ts src/__bounty__/r4-react-utils-data-loader/`. Run the type probe with `yarn workspace @winglet/react-utils exec tsc -p src/__bounty__/r4-react-utils-data-loader/tsconfig.probe.json`.
  - The probe-local `vitest.config.ts` adds the `source` condition and the `@/common-utils` alias, so `@winglet/common-utils` resolves to its `src` instead of the stale `dist`. `tsconfig.probe.json` does the same for the type probe with `customConditions`.
  - Failing tests that are not findings: none. All 12 failing tests reproduce items 1 to 3, and the 6 type errors reproduce item 4.
  - Control tests that pass:
    - "@winglet/common-utils subpaths used by the hooks are the src modules, not dist" proves that the run loaded source.
    - "control: a child mount effect schedules the parent timer once (no StrictMode)" and "control: a layout mount effect schedules the timer once (no StrictMode)" for item 1.
    - "control: useSnapshot keeps its identity for an equal input without an abandoned render" and "control: useRestProperties keeps the previous object for a shallow-equal input" for item 2.
    - "two sibling scopes render into their own anchors" and "a nested scope inside outer portal content keeps state when the outer scope is hidden and shown" in `portalScopes.r4.test.tsx` record checked hypotheses.
  - Verification limits: the probes ran in jsdom with React 19.2.6 only. React 18 was not run.
- From `r4-contracts`:
  - Probe folder in the working tree: `packages/winglet/react-utils/src/__bounty__/r4-contracts/`; the round copy is `bug-bounty/round-4/probes/winglet-react-utils/r4-contracts/`.
  - To run the copy: copy it back to `packages/winglet/react-utils/src/__bounty__/r4-contracts/` and run `yarn workspace @winglet/react-utils test --run src/__bounty__/r4-contracts/documentedImports.test.tsx`. No probe-local configuration is needed.
  - Failing tests that are not findings: none. The two README tests reproduce item 5, and the two site page tests are extra evidence for item 3.
  - Control tests that pass: "control: withErrorBoundary(Widget, fallback) shows the fallback", the documented signature with an element as the fallback.
  - Verification limits: the probe imports, for each documented subpath, the `src` file that the subpath's `source` export condition names. The package source imports `@winglet/common-utils` by name, and the default configuration resolves it to the stale `dist`; neither item 3 nor item 5 depends on `@winglet/common-utils`.

Root-cause files: `packages/winglet/react-utils/src/` for items 1, 2 and 4; the documentation site pages under `documents/` for item 3; the package READMEs `packages/winglet/react-utils/README.md` and `packages/winglet/react-utils/README-ko_kr.md` for item 5.

## 1. Calling `schedule()` from `useTimeout` inside the commit that mounts the component again, as StrictMode and an `<Activity>` reveal do, is silently dropped, so the timer never runs.

- Severity: medium. A timer started from a child's mount effect, or from a layout effect in the same component, never fires:
  - In StrictMode during development, the cleanup of the double effect run also cancels the first timer, so the callback never runs at all.
  - In production, an `<Activity>` reveal drops the schedule that the re-run effects make.
  - Consumers such as an auto-dismiss toast, or an idle-timer provider whose children start the timer, lose the timer without any error.
- Affected public API: `useTimeout` (`schedule`).
- Contract violated:
  - `packages/winglet/react-utils/docs/en/SPECIFICATION.md:584` says that `schedule()` "Starts or resets the timeout".
  - Predictability: the same effect making the same call works on the first mount and fails when the component mounts again.
  - The JSDoc at `packages/winglet/react-utils/src/hooks/useTimeout.ts:40` says that "retained schedule callbacks do no work after cleanup". The round 3 fix wrote that sentence for calls after unmount, not for effects that run while the component mounts again.
- Root cause:
  - `packages/winglet/react-utils/src/hooks/useTimeout.ts:156` returns early when `state.mounted` is `false`.
  - The flag is switched only by the hook's own passive effect at `packages/winglet/react-utils/src/hooks/useTimeout.ts:166-171`.
  - In the StrictMode double effect run and in an `<Activity>` reveal, React first runs the cleanup, which sets `mounted` to `false` and cancels the timer. It then runs layout effects and the passive effects of children before this hook's passive effect, so every `schedule()` in between sees `mounted === false` and is dropped.
  - On the first mount the flag starts as `true`, which hides the defect.
- Relation to earlier rounds: a regression introduced by the fix of [round 3 item 3](../round-3/winglet-react-utils.md). Same class as round 3 class 25 and round 2 class 4: work done in effects that `<Activity>` and StrictMode run again. `useTimeout` has now produced a finding in two consecutive rounds.
- Reopens an earlier fix: Yes, [round 3 item 3](../round-3/winglet-react-utils.md). Fix commit `afbcd8c7f` added the `mounted` guard, and `94dcbb7ba`, the performance commit of [round 3 item 2](../round-3/winglet-react-utils.md), moved it into shared state. The round 3 contract, that no work happens after unmount, stands, so this is a regression of the fix and not an oscillation.
- Reproduction: `packages/winglet/react-utils/src/__bounty__/r4-react-utils-data-loader/useTimeoutRemount.r4.test.tsx`.
  - "StrictMode: a child mount effect still schedules the parent timer" gets 0 calls, where 1 is expected.
  - "StrictMode: a layout mount effect in the same component still schedules the timer" gets 0 calls, where 1 is expected.
  - "Activity: a child effect that re-runs on reveal schedules again, like the first mount" gets `{ afterFirstMount: 1, afterReveal: 0 }`, where `afterReveal: 1` is expected.
  - The two controls without StrictMode get 1 call.
- Confidence: high. Public API in jsdom with React 19.2.6.

## 2. `useSnapshotReference`, `useSnapshot` and `useRestProperties` write their refs during render, so a suspended or abandoned transition render changes the committed snapshot.

- Severity: medium. This has the same consequence as round 3 item 2 for `useHandle`:
  - While a transition is pending, an event handler or timer that reads `useSnapshotReference(...).current` acts on input that the screen does not show.
  - After an abandoned render, an input whose content equals the committed snapshot gets a new identity. An effect that depends on the `useSnapshot` result, such as widget initialization or a refetch, therefore runs again with identical content.
  - For `useRestProperties` the cost is an extra render of a memoized child that receives the object.
- Affected public API: `useSnapshotReference`, `useSnapshot`, `useRestProperties`.
- Contract violated:
  - `packages/winglet/react-utils/docs/en/SPECIFICATION.md:317` says "The same object reference as long as the deep content is unchanged", and the example at `:320` says "Effect only re-runs when config content actually changes".
  - `packages/winglet/react-utils/docs/en/SPECIFICATION.md:350` says that `current` "updates only on content change", and `:376` says "Previous object reference if contents are shallowly equal".
  - The JSDoc at `packages/winglet/react-utils/src/hooks/useSnapshotReference.ts:6-12` says that `current` changes only when the input's contents change, and `:15-16` recommends the hook for timers, event handlers and cleanup functions.
  - `packages/winglet/react-utils/docs/agents/skills/react-utils-skill/knowledge/hooks.md:52` documents render-time writes only for `useReference`.
- Root cause:
  - `packages/winglet/react-utils/src/hooks/useSnapshotReference.ts:65` and `:70` assign `comparedRef` and `snapshotRef` during render.
  - `packages/winglet/react-utils/src/hooks/useRestProperties.ts:67`, `:74` and `:86` assign `comparedRef` and `previousRef` during render.
  - A transition render that suspends or is abandoned shares these ref objects with the committed fiber and overwrites them. The next committed render compares its input with the abandoned value, not with the committed snapshot, and returns a new object.
- Relation to earlier rounds: same class as [round 3 item 2](../round-3/winglet-react-utils.md), with the same mechanism in different functions. The round 3 decision kept the render-time contract only for `useReference`.
- Reopens an earlier fix: No. `git log -L` shows no bug bounty commit on `packages/winglet/react-utils/src/hooks/useSnapshotReference.ts:60-72`. The `useRestProperties` lines were last changed by `d8360463f`, the fix of [round 1 item 2](../round-1/winglet-react-utils.md), whose symptom stays fixed.
- Reproduction: `packages/winglet/react-utils/src/__bounty__/r4-react-utils-data-loader/reactUtils.r4.test.tsx`.
  - "useSnapshotReference: an event handler reads the committed snapshot, not a suspended transition" gets `{ shown: 'A', handled: 'B' }`, where `handled: 'A'` is expected.
  - "useSnapshot keeps its identity for an equal input after an abandoned transition render" gets `{ effectRuns: 2, sameIdentity: false }`, where `{ effectRuns: 1, sameIdentity: true }` is expected.
  - "useRestProperties keeps the previous object for a shallow-equal input after an abandoned transition render" gets `{ childRenders: 2 }`, where 1 is expected.
  - The two controls without an abandoned render pass.
- Confidence: high for the behavior and medium for its classification as a defect. The `@remarks` at `packages/winglet/react-utils/src/hooks/useSnapshotReference.ts:25-29` mentions that a discarded render's write stays, but only to explain why the comparison gate and the write move together. Public API in jsdom with React 19.2.6.

## 3. The documentation site page for `@winglet/react-utils`, in English and Korean, shows examples that do not compile or behave differently from the code, and states a stale peer range.

- Severity: low. This is documentation, but some examples fail at run time:
  - `import { Portal, withPortal } from '@winglet/react-utils/portal'` gives `undefined` for `withPortal`, so calling it throws a `TypeError`.
  - `useConstant(() => new ExpensiveManager())` stores the factory function instead of a manager.
  - `withErrorBoundary(Widget, { fallback: <p>…</p> })` renders the options object as the fallback. The boundary itself throws when `Widget` throws, and the error escapes to the parent boundary.
  - `useMemorize(deps, factory)` has its arguments reversed and returns the dependency array.
  - `useDebounce(value, delay)` is described as returning a debounced value, but it returns `{ isIdle, cancel }`.
  - The page also passes a `name` prop to `Portal` and `Portal.Anchor`, which has no effect, and gives `withUploader` an `options` argument that does not exist.
  - The page gives the peer range as `react >=16 <20`.
- Affected public API: `Portal` (through `Portal.with`), `useConstant`, `withErrorBoundary`, `useMemorize`, `useDebounce`, `withUploader`, and the `react` and `react-dom` peer range.
- Contract violated:
  - `packages/winglet/react-utils/src/components/Portal/index.ts:7` exports `withPortal` as a type only.
  - `packages/winglet/react-utils/src/hoc/withErrorBoundary/withErrorBoundary.tsx:68-71` takes `fallback?: ReactNode` as the second argument.
  - `packages/winglet/react-utils/docs/agents/skills/react-utils-skill/knowledge/hooks.md:16-25` warns that `useConstant` stores a function argument without calling it.
  - `packages/winglet/react-utils/src/hooks/useMemorize.ts:60` takes `(input, dependencies)`. `packages/winglet/react-utils/src/hooks/useDebounce.ts:78` takes `(callback, dependencyList, ms, options)` and returns `{ isIdle, cancel }`.
  - `packages/winglet/react-utils/package.json:227-228` declares the peer range `>=16.14 <20`.
- Root cause:
  - The page `documents/docs/winglet/react-utils/index.mdx` states these claims at lines 20, 41, 43, 45, 53, 55, 61, 69, 79, 81-83 and 85-88.
  - Its Korean copy `documents/i18n/ko/docusaurus-plugin-content-docs/current/winglet/react-utils/index.mdx` states them at lines 19, 40, 42, 44, 52, 54, 60, 68, 78, 80-82 and 84-87.
  - These pages are maintained by hand. The site generator never touches them (`documents/scripts/sync-winglet-docs.ts:8`), so no fix since round 1 updated them.
- Relation to earlier rounds: same class as [round 3 item 6](../round-3/winglet-react-utils.md), the stale peer range in the packaged skill, and [round 2 item 5](../round-2/winglet-react-utils.md). Round 3 class 27: documented examples that do not match the code.
- Reopens an earlier fix: No. No bug bounty fix commit touched either page.
- Reproduction: `packages/winglet/react-utils/src/__bounty__/r4-react-utils-data-loader/reactUtils.r4.test.tsx`, describe "documentation site page documents/docs/winglet/react-utils/index.mdx". All six tests fail.
  - "`import { Portal, withPortal } from '@winglet/react-utils/portal'` yields a withPortal function" gets `'undefined'`, where `'function'` is expected.
  - "`useConstant(() => new ExpensiveManager())` yields the manager" gets a function, where an `ExpensiveManager` instance is expected.
  - "`withErrorBoundary(Widget, { fallback: <p>…</p> })` renders the fallback when Widget throws" gets `'outer boundary caught'`, where `'Something went wrong.'` is expected.
  - "`useMemorize(deps, factory)` returns the factory result" gets `[1]`, where `'computed'` is expected.
  - "`useDebounce(value, delay)` returns a debounced value" gets `{ isIdle, cancel }`, where `'query'` is expected.
  - "peer dependency line matches package.json peerDependencies" gets `react >=16 <20` in both pages, where `react >=16.14 <20` is expected.
  - Extra evidence from `r4-contracts`, in `packages/winglet/react-utils/src/__bounty__/r4-contracts/documentedImports.test.tsx`:
    - "every value the documentation site page imports is exported by its subpath" collects every named import in the code blocks of the English page and gets `['./portal:withPortal']`, where `[]` is expected.
    - "the site example withErrorBoundary(Widget, { fallback }) shows the fallback when Widget throws" renders the example without an outer boundary and gets "threw: Objects are not valid as a React child (found: object with k…", where `'Something went wrong.'` is expected. The boundary renders the options object as its fallback, React rejects that object, and the error leaves the boundary.
    - The control "control: withErrorBoundary(Widget, fallback) shows the fallback" passes.
- Confidence: high. The documented examples were executed through the source entry points that the `./portal`, `./hook` and `./hoc` exports name with their `source` condition.

## 4. The public type of `withUploader` rejects every component whose `onClick` uses React's own handler types, so the documented `withUploader(Button)` does not compile.

- Severity: low. The failure surfaces at compile time: a TypeScript consumer cannot wrap an ordinary button, card or `div` component without a cast. Because the argument fails the constraint, the returned component's props also lack `children`.
- Affected public API: `withUploader`.
- Contract violated: `packages/winglet/react-utils/docs/en/SPECIFICATION.md:858` and `packages/winglet/react-utils/docs/agents/skills/react-utils-skill/knowledge/components-and-utilities.md:33` wrap an ordinary `Button`. The JSDoc examples at `packages/winglet/react-utils/src/hoc/withUploader/withUploader.tsx:57`, `:68`, `:83` and `:97` wrap `Button`, an inline `div` component, `Card` and `FormField`.
- Root cause:
  - `packages/winglet/react-utils/src/hoc/withUploader/withUploader.tsx:18` declares `onClick?: Fn<[e?: MouseEvent]>` with the DOM `MouseEvent`.
  - `Fn` (`packages/aileron/common/declare/function.d.ts:1`) is an interface with a call signature, so `strictFunctionTypes` checks its parameter contravariantly.
  - React's `MouseEvent<T>` and the DOM `MouseEvent` are not assignable in either direction, so `ButtonHTMLAttributes`, `HTMLAttributes` and any `MouseEventHandler` prop fail the `Props extends BaseProps` constraint.
- Relation to earlier rounds: New class. The public types reject the documented usage.
- Reopens an earlier fix: No.
- Reproduction: `packages/winglet/react-utils/src/__bounty__/r4-react-utils-data-loader/withUploaderTypes.probe.tsx` with `tsconfig.probe.json`.
  - `tsc` reports TS2345 for `withUploader(Button)`, `withUploader(Card)` and `withUploader(Zone)`, and TS2322 (no `children`) for the three returned components.
  - The expected result is no errors.
- Confidence: high. Static type check of the source declaration with `tsc`, with workspace types resolved through the `source` condition.

## 5. The README of `@winglet/react-utils`, in English and Korean, imports `extractProps` and `mergeRefs` from `@winglet/react-utils/object` and lists them as that subpath's contents, but neither name exists.

- Severity: low. This is documentation. A reader who copies the import gets a module link error under native ES modules ("does not provide an export named 'extractProps'"), or two `undefined` values under a bundler that does not check named imports.
- Affected public API: `@winglet/react-utils/object`.
- Contract violated: `packages/winglet/react-utils/src/utils/object/index.ts:1`, the file that the `source` condition of the `./object` export names, exports only `remainOnlyReactComponent`.
- Root cause:
  - `packages/winglet/react-utils/README.md:43` imports `extractProps` and `mergeRefs` from `@winglet/react-utils/object`, and `packages/winglet/react-utils/README.md:59` lists them as the contents of that subpath.
  - The Korean copy `packages/winglet/react-utils/README-ko_kr.md` says the same at lines 43 and 59.
- Relation to earlier rounds: Same class as [round 3 item 6](../round-3/winglet-react-utils.md) and [round 3 item 4](../round-3/winglet-react-utils.md), documents that do not match the code (round 3 class 27). Item 3 of this round has the same class on the site page.
- Reopens an earlier fix: No. `git log -L` on `packages/winglet/react-utils/README.md:43` shows only `5d4f51a43`, which added the subpath import section, and no bug bounty fix.
- Reproduction: `packages/winglet/react-utils/src/__bounty__/r4-contracts/documentedImports.test.tsx`.
  - "every value the English README imports is exported by its subpath" gets `['./object:extractProps', './object:mergeRefs']`, where `[]` is expected.
  - "every value the Korean README imports is exported by its subpath" gets the same two names.
- Confidence: high. The probe checks every named import in the README's code blocks against the `src` file that the subpath's `source` condition names; no `dist` is read.

## Hypotheses checked and not bugs

- Two sibling `Portal.with` scopes render into their own anchors.
- A nested scope inside the content of an outer portal keeps the state of both counters when the whole outer scope is hidden by `<Activity>` and shown again under StrictMode. The watch-list combination of `Portal` and `<Activity>` produced no third-round finding.
- `packages/winglet/react-utils/docs/agents/skills/react-utils-skill/knowledge/portal-system.md:27` says that unmounting any anchor clears the destination, while the code now clears it only when the current anchor is removed. The document still tells readers to mount exactly one anchor, so what a reader does does not change.
- `useHandle` called during render reads the previous commit, which the round 3 decision for [round 3 item 2](../round-3/winglet-react-utils.md) covers: only committed handlers run.
- `useDebounce` is not affected by item 1, because its effect is declared after the `useTimeout` effect in the same hook and therefore runs after the flag is set again.
- The `console.error` call in the `ErrorBoundary` `componentDidCatch` is documented in `packages/winglet/react-utils/docs/agents/skills/react-utils-skill/knowledge/components-and-utilities.md`.
- `withUploader`'s `openFilePicker` keeps the input's identity and DOM position in jsdom. Whether a real browser opens the file dialog for the temporarily detached input was not checked.
- From `r4-contracts`: `@winglet/react-utils/portal` exports `Anchor`, `BasePortal` and `withPortal` as types only on purpose, because the compound `Portal` carries the values (`Portal.with`, `Portal.Anchor`), so item 3 treats the site page as wrong, not the export.
