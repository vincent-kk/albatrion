# @winglet/react-utils: bug bounty round 3

This round confirmed 6 new findings in `@winglet/react-utils`. Items in the earlier round documents ([round 1](../round-1/winglet-react-utils.md), [round 2](../round-2/winglet-react-utils.md)) were treated as fixed and excluded. The main session re-ran every probe. Verification limits are listed under the probes.

Probes: [probes/winglet-react-utils/](probes/winglet-react-utils/)

- From `r3-contracts`:
  - Probe folder in the working tree: `packages/winglet/react-utils/src/__bounty__/r3-contracts/`; the round copy is `bug-bounty/round-3/probes/winglet-react-utils/r3-contracts/`.
  - To run the copy: copy it back to `packages/winglet/react-utils/src/__bounty__/r3-contracts/` and run `yarn workspace @winglet/react-utils test --run src/__bounty__/r3-contracts/useDebounceTrailing.test.ts`.
  - Failing tests that are not findings: none.
  - Control tests that pass: none in this file; the existing `packages/winglet/react-utils/src/hooks/__tests__/useDebounce.test.ts:176-214` pins the trailing call.
  - Verification limits: None.
- From `r3-react-utils-data-loader`:
  - Probe folder in the working tree: `packages/winglet/react-utils/src/__bounty__/r3-react-utils-data-loader/`; the round copy is `bug-bounty/round-3/probes/winglet-react-utils/r3-react-utils-data-loader/`.
  - To run the copy: copy it back to `packages/winglet/react-utils/src/__bounty__/r3-react-utils-data-loader/` and run `yarn workspace @winglet/react-utils test --run src/__bounty__/r3-react-utils-data-loader/`. Eight of the eleven tests fail, and all eight are findings.
  - Failing tests that are not findings: None.
  - Control tests that pass: "control: raw createPortal into a persistent host inside the same Activity keeps state", "control: raw createPortal to a persistent host keeps state across the same suspension", and "renders and bubbles clicks like the light DOM" for a `Portal` inside a shadow root.
  - Verification limits: The probes ran in jsdom with React 19.2.6 only. React 18 was not run, so the Suspense trigger of item C is unverified there, and React 18 has no `Activity`. The file dialog that `withUploader` opens cannot be observed in jsdom, as the round 2 known limits already state.

Root-cause files: `packages/winglet/react-utils/`

## 1. When a whole `Portal.with` scope, or the `Portal.Anchor` alone, is hidden by `<Activity mode="hidden">` or by a Suspense boundary that suspends again, the content of every `Portal` in that scope is unmounted and loses its state.

- Severity: medium. A modal or form inside a page that an `Activity` keeps alive resets when the user switches tabs and returns. When the anchor sits inside a Suspense boundary that suspends again, the content of a `Portal` whose source lies outside that boundary also resets.
- Affected public API: `Portal`, `Portal.with`, `Portal.Anchor`.
- Contract violated: `packages/winglet/react-utils/docs/agents/skills/react-utils-skill/knowledge/portal-system.md:7` and `packages/winglet/react-utils/docs/agents/skills/react-utils-skill/SKILL.md:25` state "Activity hide/show preserves subtree state." `packages/winglet/react-utils/src/components/Portal/INTENT.md:10` and `packages/winglet/react-utils/src/components/Portal/DETAIL.md:6` state the same guarantee without restricting it to an `Activity` around the source only.
- Root cause: `packages/winglet/react-utils/src/components/Portal/Anchor.tsx:124` attaches the provider's state setter as the anchor's callback ref, and `packages/winglet/react-utils/src/components/Portal/context/PortalContextProvider.tsx:11` stores the anchor in state. React 19 detaches host refs when an `Activity` or a Suspense boundary hides its content, so the anchor becomes `null`, and `packages/winglet/react-utils/src/components/Portal/Portal.tsx:16` returns `null`, which deletes every portal subtree. When the content is shown again, the same anchor element attaches again, but the content mounts fresh, because a temporary detach is not distinguished from a real removal.
- Relation to earlier rounds: Sibling of `../round-2/winglet-react-utils.md` item 1, with the same symptom through a different mechanism: a ref detach instead of a registration cleanup.
- Reopens an earlier fix: Yes, `../round-2/winglet-react-utils.md` item 1, fix commit `bafee47ea`, which created `packages/winglet/react-utils/src/components/Portal/context/PortalContextProvider.tsx:10-16`. The contract stands and the fix is incomplete: its regression test wraps only the `Portal` source in `Activity`. This input goes past the round 2 known limit in `../round-2/FIXES.md` for `@winglet/react-utils`, which covers only replacing the anchor.
- Reproduction: `packages/winglet/react-utils/src/__bounty__/r3-react-utils-data-loader/reactUtils.r3.test.tsx`.
  - The test "keeps portal content state when the whole Portal.with scope is hidden and shown" gets `{ portal: '0', inline: '2' }`, where `{ portal: '2', inline: '2' }` is expected. The test "same under StrictMode" gets the same result.
  - The test "a Portal source outside the suspended boundary keeps its content state" gets `modal: '0'`, where `'2'` is expected.
  - The two raw `createPortal` controls keep `'2'`.
- Confidence: high. Public API in jsdom with React 19.2.6.

## 2. While a suspended transition is pending, a `useHandle` callback reads the props and state of the uncommitted render, so the screen shows `'A'` while the handle acts on `'B'`.

- Severity: medium, and the decision belongs to the owner. During a pending `startTransition`, a button wired through `useHandle`, such as "delete the current item", acts on an item the screen does not show yet. `useOnUnmount` reads the same reference, so an unmount during the pending transition runs cleanup with values that were never shown. The owner must decide because `packages/winglet/react-utils/docs/agents/skills/react-utils-skill/knowledge/hooks.md:52` documents the render-time write as intended. No document states that the write lets an uncommitted render leak into the handle, and no test pins that consequence.
- Affected public API: `useHandle`, `useReference`, `useOnUnmount`, `useOnUnmountLayout`.
- Contract violated: React's reference rule not to write or read `ref.current` during rendering ([React `useRef` caveats](https://react.dev/reference/react/useRef#caveats)), and predictability. A stable callback acts on state that the committed user interface does not show. `packages/winglet/react-utils/docs/en/SPECIFICATION.md:274` promises the latest handler without saying that the latest may never commit.
- Root cause: `packages/winglet/react-utils/src/hooks/useReference.ts:92` assigns `reference.current = value` during render, and `packages/winglet/react-utils/src/hooks/useHandle.ts:73` and `:76` read that reference when the handle is called. A transition render that suspends, or is interrupted, still overwrites the reference before React decides whether to commit it.
- Relation to earlier rounds: New class.
- Reopens an earlier fix: No.
- Reproduction: `packages/winglet/react-utils/src/__bounty__/r3-react-utils-data-loader/reactUtils.r3.test.tsx`, test "the stable handle reads the committed render, not a suspended transition". The actual result is `{ shown: 'A', handled: 'B' }`; the expected result is `{ shown: 'A', handled: 'A' }`.
- Confidence: high for the behavior and medium for its classification as a defect, because the mechanism is documented. Public API.

## 3. Calling `schedule()` from `useTimeout` after the component unmounts creates a timer that runs the callback after the unmount.

- Severity: medium. When a component calls `schedule()` after an awaited request and the user leaves before the request finishes, a delayed navigation, save or analytics callback still runs for the screen the user left. The timer leaks past the unmount.
- Affected public API: `useTimeout`.
- Contract violated: The JSDoc at `packages/winglet/react-utils/src/hooks/useTimeout.ts:24` promises "Auto-cleanup: Prevents memory leaks on unmount". The existing test "should not run a pending callback after the component unmounts" (`packages/winglet/react-utils/src/hooks/__tests__/useTimeout.test.ts:500`) pins the intent that no callback runs after unmount.
- Root cause: `schedule` (`packages/winglet/react-utils/src/hooks/useTimeout.ts:123-131`) registers a `setTimeout` without checking whether the component is still mounted. The cleanup at `packages/winglet/react-utils/src/hooks/useTimeout.ts:141` cancels only a timer that already exists when the component unmounts.
- Relation to earlier rounds: New class.
- Reopens an earlier fix: No.
- Reproduction: `packages/winglet/react-utils/src/__bounty__/r3-react-utils-data-loader/reactUtils.r3.test.tsx`, test "schedule() called after unmount does not run the callback". The actual result is `{ calls: 1, idle: true }`; the expected result is `{ calls: 0, idle: true }`.
- Confidence: high. Public API.

## 4. The packaged knowledge says the default `useDebounce` suppresses the trailing call, but a burst of dependency changes runs the callback on the leading edge and again on the trailing edge.

- Severity: low. A consumer that relies on the documented single call per burst (one search request while the user types, for example) gets two executions per burst. This is a contract conflict in which the consumer-facing document is the wrong side.
- Affected public API: `useDebounce` with the default `immediate: true`.
- Contract violated: `packages/winglet/react-utils/docs/agents/skills/react-utils-skill/knowledge/hooks.md:85` and `SKILL.md:59`. The JSDoc example at `packages/winglet/react-utils/src/hooks/useDebounce.ts:47` ("then debounce subsequent changes") and the test at `src/hooks/__tests__/useDebounce.test.ts:176-214` pin the current behavior.
- Root cause: in `packages/winglet/react-utils/src/hooks/useDebounce.ts`, a dependency change during the timer sets `isScheduled` instead of calling (`:105-107`), and the timer callback then runs the trailing call (`:95`), which the packaged knowledge describes as suppressed.
- Relation to earlier rounds: Same class as round 1 class 19, documented behavior that does not hold.
- Reopens an earlier fix: No.
- Reproduction: `useDebounceTrailing.test.ts`, "default useDebounce fires once per burst of dependency changes, with no trailing call": the callback runs 2 times, the documented expectation is 1.
- Confidence: high; verified through the public API.

## 5. One click on a `withUploader` component still runs an ancestor's `onClickCapture` handler and a document capture-phase listener twice.

- Severity: low. Capture-phase analytics or toggles on an ancestor fire twice for each user click, in the light DOM and inside a shadow root alike. Capture-phase handlers are less common than the bubble-phase handlers that the round 2 fix covers.
- Affected public API: `withUploader`.
- Contract violated: `packages/winglet/react-utils/src/hoc/withUploader/DETAIL.md:9` says the hidden input's synthetic click stops propagating, so that only the original click reaches ancestor handlers.
- Root cause: The synthetic click from `inputRef.current?.click()` (`packages/winglet/react-utils/src/hoc/withUploader/withUploader.tsx:129`) is stopped by the input's own `onClickCapture` handler (`packages/winglet/react-utils/src/hoc/withUploader/withUploader.tsx:139` and `:149-151`). React runs capture-phase handlers from the outermost ancestor inward, so every ancestor's `onClickCapture` runs before the input's handler stops the event. Native document capture listeners receive the event even before the React root does.
- Relation to earlier rounds: Sibling of `../round-2/winglet-react-utils.md` item 2.
- Reopens an earlier fix: Yes, `../round-2/winglet-react-utils.md` item 2, fix commit `a09228260`, which stops only the bubble-phase duplicate.
- Reproduction: `packages/winglet/react-utils/src/__bounty__/r3-react-utils-data-loader/reactUtils.r3.test.tsx`, tests "an ancestor onClickCapture runs once per user click (light DOM)" and "same inside a shadow root". Both get `{ reactCapture: 2, reactBubble: 1, documentCapture: 2 }`, where 1 is expected for every count.
- Confidence: high. Public API.

## 6. The shipped agent skill `SKILL.md` still states the React peer range as `>=16 <20`, while the package manifest requires `>=16.14 <20`.

- Severity: low. An agent that reads the skill tells consumers that React 16.0 to 16.13 is supported, although the published bundle needs the JSX runtime that only 16.14 and later provide.
- Affected public API: The packaged agent documentation `docs/agents/skills/react-utils-skill/SKILL.md`, and the `react` and `react-dom` peer dependency range.
- Contract violated: `packages/winglet/react-utils/package.json` declares `peerDependencies` of `>=16.14 <20`, and `packages/winglet/react-utils/src/DETAIL.md` requires React and React DOM 16.14 or later.
- Root cause: `packages/winglet/react-utils/docs/agents/skills/react-utils-skill/SKILL.md:85` was not updated after `../round-2/winglet-react-utils.md` item 5. The round 2 fix commits `86fba5987` and `d021d2f15` changed only the manifest.
- Relation to earlier rounds: Sibling of `../round-2/winglet-react-utils.md` item 5.
- Reopens an earlier fix: No. `git log -L` on `SKILL.md:85` shows no bug bounty fix commit.
- Reproduction: `packages/winglet/react-utils/src/__bounty__/r3-react-utils-data-loader/reactUtils.r3.test.tsx`, test "SKILL.md peer sentence matches package.json peerDependencies". The actual value is `'>=16 <20'`; the expected value is `'>=16.14 <20'`.
- Confidence: high. Static check by comparing the two files.

## Hypotheses checked and not bugs

- From `r3-contracts`:
  - Helper candidates judged not to change what a consumer does: `knowledge/components-and-utilities.md:25` (no error channel, although `withErrorBoundary` accepts a `useReporter` third argument) and `knowledge/components-and-utilities.md:7` with `SKILL.md:42` and `:61` (refs dropped, although React 19 forwards them) only add needless work; the `useWindowSize` hydration warning (`knowledge/hooks.md:89`), the `useHandle(undefined)` typing and the `useSnapshot` omit timing are cautions of the same kind.
  - The stale peer range in `SKILL.md:85` is recorded by item 6.
  - The `@winglet/react-utils` runtime uses no React 18-only or React 19-only API, consistent with its `>=16.14 <20` peer range.
- From `r3-react-utils-data-loader`:
  - A `Portal` inside a shadow root renders and bubbles clicks like a `Portal` in the light DOM; the control test passes.
  - The bubble-phase ancestor `onClick` of a `withUploader` component runs once per click, in the light DOM and inside a shadow root, so the round 2 fix holds for that phase.
  - An `ErrorBoundary` reporter that throws inside `componentDidCatch` lets the error escape the boundary. React class boundaries and `react-error-boundary` behave the same way, so this is not reported.
  - `useTimeout` cancels a pending timer when an `Activity` hides the component. This is the same kind of effect-cleanup cancellation that `../round-2/FIXES.md` decided for `../round-2/lerx-promise-modal.md` item 5.
  - With `immediate: true`, `useDebounce` makes a leading call and a trailing call when dependencies change during the wait. The test "should debounce changes during timer period" (`packages/winglet/react-utils/src/hooks/__tests__/useDebounce.test.ts:176`) and the JSDoc pin this behavior, so the code is not a bug. The documentation wording "suppressing the trailing call" is recorded as item 4.
  - `@winglet/react-utils` has no outside-click handling: it registers no document listeners, and only `useWindowSize` listens on `window`. The outside-click angle therefore had nothing to target.
