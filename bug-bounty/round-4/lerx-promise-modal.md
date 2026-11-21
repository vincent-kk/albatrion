# @lerx/promise-modal: bug bounty round 4

This round confirmed 5 new findings in `@lerx/promise-modal`: 2 medium and 3 low. Items in the earlier round documents ([round 1](../round-1/lerx-promise-modal.md), [round 2](../round-2/lerx-promise-modal.md), [round 3](../round-3/lerx-promise-modal.md)) were treated as fixed and excluded. The main session re-ran every probe through the probe-local source configuration. On React 19, 14 of 35 tests fail. On React 18, 10 of 35 tests fail and 7 are skipped. Every failing test belongs to one of the five items. Hunter `r4-contracts` wrote no probe for this package; its checked hypotheses and its open lead below come from reading the code and the published package.

Probes: [probes/lerx-promise-modal/](probes/lerx-promise-modal/)

- From `r4-promise-modal`:
  - Probe folder in the working tree: `packages/lerx/promise-modal/src/__bounty__/r4-promise-modal/`. The round copy is `bug-bounty/round-4/probes/lerx-promise-modal/r4-promise-modal/`.
  - To run the copy: copy it back to `packages/lerx/promise-modal/src/__bounty__/r4-promise-modal/`. Then run `yarn workspace @lerx/promise-modal test --run --config src/__bounty__/r4-promise-modal/vitest.config.ts src/__bounty__/r4-promise-modal/` for React 19 and `yarn workspace @lerx/promise-modal test --run --config src/__bounty__/r4-promise-modal/vitest.react18.config.ts src/__bounty__/r4-promise-modal/` for React 18.
  - The probe-local configurations extend the package's `vite.config.ts` and `vitest.react18.config.ts`. They put the `source` export condition first in `resolve.conditions` and `ssr.resolve.conditions`, keep Vite's default conditions after it, and add the `@/common-utils`, `@/style-utils` and `@/react-utils` aliases. As a result, `@winglet/*` load from `src` instead of a stale `dist`.
  - Failing tests that are not findings: none.
  - Under React 18, the seven rows that need `Activity` are skipped, because `Activity` exists only in React 19. This is an environment limit, not a failure.
  - Control tests that pass:
    - `sourceResolution.render.test.tsx` reads stack frames from `@winglet/common-utils` (`map`), `@winglet/style-utils` (`compressCss`) and `@winglet/react-utils` (`useHandle`). Through the probe-local configuration, every frame is under `packages/winglet/<name>/src/`. Under the package's default configuration the same test fails with `[ 'dist', 'dist', 'dist' ]`, so the control can tell the two apart.
    - `hiddenSettleFocus.render.test.tsx`, "control: returns focus to the opener when a displayed request is aborted".
    - `pathnameHidden.render.test.tsx`: navigation while the Provider is shown, and both polling rows.
    - `contentResuspendFocus.render.test.tsx`: a Provider that re-suspends and reveals returns focus into the dialog.
    - `isolatedSystems.render.test.tsx`: one package copy releases the scroll lock after two dialogs close in opening order.
    - `manyAtOnce.render.test.tsx`, `failureRecovery.render.test.tsx` and `containerActivity.render.test.tsx` pass. They are listed under the hypotheses below.
  - Verification limits specific to this package:
    - jsdom has no Navigation API. Item 2 installs an `EventTarget` as `window.navigation` and dispatches `currententrychange` after `history.pushState`.
    - jsdom keeps focus on an element that React hides with `display: none`, whereas a browser runs the [focus fixup rule](https://html.spec.whatwg.org/multipage/interaction.html#focus-fixup-rule). Item 4 applies that fixup in the probe by calling `blur()`.
    - The React 18 run prints jsdom "Uncaught" errors from React 18's development error replay in `failureRecovery.render.test.tsx`. Those tests pass.

Root-cause files: `packages/lerx/promise-modal/src/`

## 1. When a dimmed request that is not displayed settles by abort, focus leaves the page control the user is working in and moves to the request's opener.

- Severity: medium. The request may be hidden by its route, hidden because its Provider is inside `<Activity mode="hidden">` or a re-suspended Suspense boundary, or detached with `root={null}`. A user who presses Back while a confirm with a timeout is open, and then types in a search field on the new route, has focus pulled to a header button such as "Save" when the timeout aborts the hidden confirm. The next Space or Enter press then activates that button.
- Affected public API:
  - The `signal` option of `alert`, `confirm`, and `prompt`.
  - `useModal` cleanup of hidden requests.
  - Either of the above combined with `usePathname`, the `root` prop of `ModalProvider` or `useInitializeModal`, or a hidden Provider.
- Contract violated:
  - `packages/lerx/promise-modal/docs/en/SPECIFICATION.md:137` says that only `alive && visible && dimmed && !settled` modals participate in focus.
  - `packages/lerx/promise-modal/docs/en/SPECIFICATION.md:139` says that hiding by route releases participation immediately, and that a detached anchor neither isolates nor locks the page.
  - `packages/lerx/promise-modal/docs/en/SPECIFICATION.md:151` says that hiding only the Provider releases its keyboard, focus and page effects.
  - The same paragraph at `packages/lerx/promise-modal/docs/en/SPECIFICATION.md:139` also says that focus returns to the connected opener on settlement, so the contract reading is arguable.
- Root cause:
  - `packages/lerx/promise-modal/src/app/ModalManager.ts:96` calls `restoreFocus` on a node's first settlement whenever `node.dimmed` is true. It does not check whether the node was displayed, or whether the anchor is attached.
  - `packages/lerx/promise-modal/src/app/ModalManager.ts:306-313` then focuses the opener when it is connected and not inert.
  - While the request is hidden, its page effects are already released, so the opener is not inert. Nothing checks that focus currently sits on a page control outside any modal.
- Relation to earlier rounds: Sibling of [round 2 item 2](../round-2/lerx-promise-modal.md), an asymmetry between the hiding condition and the display condition, and of [round 3 item 2](../round-3/lerx-promise-modal.md), which made Provider hiding release focus. Here the focus side of a hidden request is not released at settlement.
- Reopens an earlier fix: No. The main session's `git log -L 90,100` on `packages/lerx/promise-modal/src/app/ModalManager.ts` shows `c16301934`, `f5823f6ee` and `26a6082d5`, none of which is a bug bounty fix. The restore condition at line 96 came from `f5823f6ee`.
- Reproduction: `hiddenSettleFocus.render.test.tsx`.
  - "keeps focus in the page input when a request hidden by route is aborted": the actual focus is the "Save" opener, and the expected focus is the "Search" input.
  - "keeps focus in the page input when a request of a hidden Provider is aborted (activity)" and "(suspense)": the same result.
  - "keeps focus in the page input when a request of a detached (root={null}) Provider is aborted": the same result.
  - The control with a displayed request returns focus to the opener and passes.
  - Four rows fail on React 19. Three rows fail on React 18, where the Activity row is skipped.
- Confidence: high for the behavior and medium for the contract; public API, source through a probe-local config.

## 2. With the Navigation API, the default pathname hook misses a navigation made while the Provider was hidden, so a modal opened on the old route is displayed on the new route and makes the page inert.

- Severity: medium. A modal that belongs to another route covers and isolates the new route until the next navigation. This happens when the Provider is hidden by `<Activity mode="hidden">` or by a re-suspended Suspense boundary, the route changes while it is hidden, and the browser has the Navigation API, as Chromium-based browsers do.
- Affected public API: `ModalProvider` and `useInitializeModal` without a custom `usePathname`, which use the default pathname hook.
- Contract violated:
  - `packages/lerx/promise-modal/README.md:354` says that route navigation hides pending requests.
  - `packages/lerx/promise-modal/docs/en/SPECIFICATION.md:157` says that the default pathname hook uses Navigation API events when available.
  - `packages/lerx/promise-modal/docs/en/SPECIFICATION.md:151` says that the same modal returns when the Provider is shown.
  - Predictability: in the same scenario, the polling branch of the same hook hides the modal.
- Root cause:
  - `packages/lerx/promise-modal/src/app/hooks/useDefaultPathname.ts:27-34`: the Navigation API branch adds its `currententrychange` and `popstate` listeners in a layout effect and never reads the current pathname. The polling branch synchronizes immediately at `packages/lerx/promise-modal/src/app/hooks/useDefaultPathname.ts:35-36`.
  - Hiding the Provider runs the layout effect cleanup, which removes the listeners, so a navigation made while hidden is never observed.
  - When the Provider is shown, the route effect at `packages/lerx/promise-modal/src/providers/ModalManagerContext/ModalManagerContextProvider.tsx:77-90` runs again with the stale `pathname` and calls `onShow` on the old route's node.
- Relation to earlier rounds: [Round 3 class 25](../round-3/README.md), work done in effects that `<Activity>` re-runs. It is adjacent to [round 3 item 2](../round-3/lerx-promise-modal.md), whose fix keeps requests pending while the Provider is hidden.
- Reopens an earlier fix: No. The main session's `git log -L 25,37` on `packages/lerx/promise-modal/src/app/hooks/useDefaultPathname.ts` shows `c16301934`, `dc3f58499` and `94bb5f8c4`, none of which is a bug bounty fix.
- Reproduction: `pathnameHidden.render.test.tsx`.
  - "hides a modal opened on /a after a navigation to /b made while the Provider was hidden (activity, Navigation API)" and "(suspense, Navigation API)": the actual result is `{ visible: true, settled: false, inertPage: true }`. The expected result is `{ visible: false, settled: false, inertPage: false }`.
  - Three controls pass: navigation while the Provider is shown, and the Activity and Suspense rows of the polling branch.
  - Two rows fail on React 19. On React 18 only the Suspense row runs, and it fails.
- Confidence: high; public API with a simulated `window.navigation` in jsdom, source through a probe-local config.

## 3. A `manualDestroy` request that settles while its Provider is hidden is displayed again at opacity 1 when the Provider is shown, and plays its exit animation.

- Severity: low. A request cancelled while hidden briefly reappears for its exit duration. The documented ways to settle it while hidden are cancellation by a hidden `useModal` caller and abort. With the README's animated frame, the cancelled dialog shows fully opaque and then fades out.
- Affected public API: The `manualDestroy` option with `useDestroyAfter` and `useModalAnimation`, combined with `useModal` or the `signal` option and a hidden Provider.
- Contract violated:
  - `packages/lerx/promise-modal/README.md:354` says that a settled modal never reappears, including in manual destruction mode.
  - `packages/lerx/promise-modal/docs/en/SPECIFICATION.md:153` says that a closed manual node may remain alive for its exit animation but cannot show again.
  - The [round 3 item 5](../round-3/lerx-promise-modal.md) decision, recorded in [round 3 FIXES.md](../round-3/FIXES.md), records whether a node was displayed when it first settled. Here the node was not displayed, yet it is recorded as displayed.
- Root cause:
  - `packages/lerx/promise-modal/src/core/node/ModalNode/AbstractNode.ts:127` and `packages/lerx/promise-modal/src/core/node/ModalNode/AbstractNode.ts:136` record `__isVisibleAtSettlement__` from the route-based `__visible__`, which a hidden Provider does not change.
  - `packages/lerx/promise-modal/src/components/Foreground/Foreground.tsx:51-56` and `packages/lerx/promise-modal/src/components/Background/Background.tsx:43-48` add the display class from that record.
  - While the Provider is hidden, the passive effect of `useDestroyAfter` does not run, so the node stays alive until the Provider is shown.
- Relation to earlier rounds: Sibling of [round 3 item 5](../round-3/lerx-promise-modal.md), and round 3 class 21, a fix that left a case out while its contract stands.
- Reopens an earlier fix: Round 3 item 5, commits `12cc48f09` and `782dc4fe3`. This is an input that fix did not cover, a hidden Provider instead of a hidden route. The fix's own regression tests still pass.
- Reproduction: `providerHiddenSettle.render.test.tsx`, using the README "Animation and destruction" frame verbatim.
  - "does not display a manualDestroy request settled by hidden caller while its Provider was hidden (activity)": the actual result is `{ displayedOnShow: true, opacityOnShow: '1' }`. The expected result is that the request is not displayed.
  - The rows for abort, and for a re-suspended Suspense boundary, give the same result.
  - Four rows fail on React 19. Two rows fail on React 18, where the Activity rows are skipped.
- Confidence: high; public API, source through a probe-local config.

## 4. After the content of a displayed modal re-suspends and is revealed again, focus stays on the body while the page remains inert.

- Severity: low. Keyboard and screen reader users lose their place after content inside a modal reloads, for example a results page that suspends through `use` or a suspense query. Pressing Tab recovers focus through the trap.
- Affected public API: The `content`, `Input`, and `footer` options of `alert`, `confirm`, and `prompt`, and a custom `ForegroundComponent` that suspends after it was shown.
- Contract violated:
  - `packages/lerx/promise-modal/docs/en/SPECIFICATION.md:137` says that focus moves into the top participant on appearance.
  - Predictability: when the Provider itself re-suspends and is revealed, focus does move back into the dialog, as the control shows.
  - The [WAI-ARIA dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/) keeps focus inside an open modal dialog.
- Root cause:
  - The Suspense boundary that [round 3 item 1](../round-3/lerx-promise-modal.md) placed in each presenter (`packages/lerx/promise-modal/src/components/Presenter/Presenter.tsx:34`) hides the whole frame. The frame's ref detaches and unregisters it through `packages/lerx/promise-modal/src/app/ModalManager.ts:246-250`.
  - The node keeps participating, so `packages/lerx/promise-modal/src/app/ModalManager.ts:331-333` leaves its id in the `focused` set.
  - When the revealed frame registers again, `packages/lerx/promise-modal/src/app/ModalManager.ts:338-345` treats the node as already focused and does not move focus.
- Relation to earlier rounds: Sibling of [round 3 item 1](../round-3/lerx-promise-modal.md), the same Suspense boundary, and round 3 class 25.
- Reopens an earlier fix: No. The lines at `packages/lerx/promise-modal/src/app/ModalManager.ts:323-346` were last changed by `f5823f6ee` and `c16301934`.
- Reproduction: `contentResuspendFocus.render.test.tsx`.
  - "returns focus into a dialog whose content re-suspended and then revealed again": the actual result is `{ focusInsideDialog: false, pageInert: true }`. The expected result is `{ focusInsideDialog: true, pageInert: true }`.
  - The control "returns focus into the dialog when the Provider re-suspends and reveals" passes.
  - The test fails on React 19 and React 18.
- Confidence: medium; public API in jsdom with the focus fixup applied by the probe, source through a probe-local config.

## 5. Two package copies with incompatible state versions on one page make each other's dialogs inert, leave the body with `overflow: hidden` after both dialogs close, and repeat the README frame's `title-${id}` ids.

- Severity: low. With two bundles of different incompatible versions on one page, neither dialog can be operated with a pointer, and the page stays unscrollable after both close. This is reachable only with a future incompatible copy, because every published version uses state version 1.
- Affected public API: `ModalProvider`, `alert`, and `confirm` in two incompatible copies, and the custom frame example at `packages/lerx/promise-modal/README.md:75`.
- Contract violated:
  - `packages/lerx/promise-modal/docs/en/SPECIFICATION.md:261` says that incompatible versions remain isolated.
  - `packages/lerx/promise-modal/src/app/helpers/getModalManagerState/getModalManagerState.ts:11-14` says that incompatible registries remain untouched.
  - The "Platform integration" section of `packages/lerx/promise-modal/docs/agents/skills/promise-modal-skill/SKILL.md` says that incompatible state versions stay independent.
  - The [HTML `id` attribute](https://html.spec.whatwg.org/multipage/dom.html#the-id-attribute) must be unique in its tree.
- Root cause:
  - `packages/lerx/promise-modal/src/app/helpers/getModalManagerState/getModalManagerState.ts:22-28` gives the incompatible copy its own private state.
  - The inert snapshot at `packages/lerx/promise-modal/src/app/ModalManager.ts:351-376` treats the other system's anchor as page content, makes it inert, and preserves inert attributes it did not set.
  - `packages/lerx/promise-modal/src/app/ModalManager.ts:381-416` saves and restores the inline overflow separately in each system. When the dialogs close in opening order, the second system restores the `hidden` value that the first system set.
  - `packages/lerx/promise-modal/src/app/helpers/getModalManagerState/helpers/createModalManagerState.ts:34` starts every system's modal ids at 0.
- Relation to earlier rounds: Sibling of [round 2 items 6 and 7](../round-2/lerx-promise-modal.md), round 2 class 5 (more than one copy of a package), and round 3 class 23 (one identifier shared by every instance or copy on a page).
- Reopens an earlier fix: No.
- Reproduction: `isolatedSystems.render.test.tsx`. The probe fills the registry slot with `{ version: 99 }` and loads a second copy through `vi.resetModules`.
  - "keeps the newest dialog of an independent copy interactive while a dialog of this copy is open": the actual result is `otherCopyDialogInert: true`, while this copy's dialog is also inert. The expected result is `otherCopyDialogInert: false`.
  - "releases the body scroll lock after dialogs of two independent copies close in opening order": the actual result is `{ whileOtherOpen: '', afterBothClosed: 'hidden' }`. The expected result is `{ whileOtherOpen: 'hidden', afterBothClosed: '' }`.
  - "gives the README frame title ids that stay unique when two independent copies each open a dialog": one distinct `aria-labelledby` value for two dialogs, where two are expected.
  - The single-copy control passes.
  - Three rows fail on React 19 and on React 18.
- Confidence: high for the behavior and low for reachability; an internal fixture simulating an incompatible copy, source through a probe-local config.

## Hypotheses checked and not bugs

- From `r4-promise-modal`:
  - Opening an alert, a confirm, and a prompt with `Promise.all` in one task gives the same results as opening them one at a time. Three Escape presses settle them top first, and focus, inert, overflow, and the store return to their initial state (`manyAtOnce.render.test.tsx`, React 18 and 19).
  - Closing all three at once also gives the same results, whether through one shared signal or through a `useModal` caller that leaves. A typed prompt confirmed on top leaves the lower requests pending.
  - Render, layout effect, and update failures in content, and a rejected lazy chunk with or without its own Suspense boundary, each reject exactly once and leave nothing behind. A following valid request matches the baseline (`failureRecovery.render.test.tsx`, React 18 and 19).
  - The README `ContainerApp` and `ManualApp` examples keep the prompt value and the anchor inside the container across an Activity hide (`containerActivity.render.test.tsx`).
  - When the Provider itself re-suspends and is revealed, focus returns into the dialog.
  - The polling branch of the default pathname hook picks up a navigation made while the Provider was hidden. A custom `usePathname` hook is unaffected, because a hidden subtree still receives context updates (static).
  - `@winglet/react-utils`'s `ErrorBoundary` logs a caught modal render failure with `console.error` in production as well. This was not reported, because React 19 logs caught errors by default anyway.
  - Independent applications that load compatible copies share one modal system. This is the documented design of the major changeset `.changeset/promise-modal-shared-runtime.md`.
- From `r4-contracts`:
  - The published 0.14.1, read from its registry tarball, has no `Symbol.for` key, so it shares no realm registry with the current runtime and cannot be taken for a compatible copy.
  - Both bundles start with the `'use client'` directive, which `packages/lerx/promise-modal/rolldown.config.mjs:35` adds as a banner.
  - The site page's `backdrop: 'rgba(0,0,0,0.35)'` (`documents/docs/lerx/promise-modal/index.mdx:98`) does not match the `Color` type of the `backdrop` option (`packages/lerx/promise-modal/src/types/option.ts:11`, `packages/aileron/common/declare/unit.d.ts:11-15`), which requires a space after each comma; it was not reported, because the value works at run time and only a type check rejects it.

## Open leads

- From `r4-contracts`:
  - Under `moduleResolution: node10`, the root declarations of `@lerx/promise-modal` probably lose the types that depend on `@winglet/style-utils/style-manager`. `packages/lerx/promise-modal/src/app/types/ModalManagerState.ts:1` imports `styleManagerFactory` from that subpath, and `packages/winglet/style-utils/package.json` declares no `typesVersions`, so node10 cannot resolve it. This is the mechanism of [winglet-json-schema item 1](winglet-json-schema.md) and of the `FormHandle.submit` item in [canard-schema-form item 19](canard-schema-form.md). It was not probed, and which public type reaches `ModalManagerState` was not traced.
