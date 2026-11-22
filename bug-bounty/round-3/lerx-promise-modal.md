# @lerx/promise-modal: bug bounty round 3

This round confirmed 7 new findings in `@lerx/promise-modal`. Items in the earlier round documents ([round 1](../round-1/lerx-promise-modal.md), [round 2](../round-2/lerx-promise-modal.md)) were treated as fixed and excluded. The main session re-ran every probe. Verification limits are listed under the probes.

Probes: [probes/lerx-promise-modal/](probes/lerx-promise-modal/)

- From `r3-contracts`:
  - None. The checks below were static or reused existing behavior.
- From `r3-promise-modal`:
  - Probe folder in the working tree: `packages/lerx/promise-modal/src/__bounty__/r3-promise-modal/`; the round copy is `bug-bounty/round-3/probes/lerx-promise-modal/r3-promise-modal/`.
  - To run the copy: copy it back to `packages/lerx/promise-modal/src/__bounty__/r3-promise-modal/` and run `yarn workspace @lerx/promise-modal test --run src/__bounty__/r3-promise-modal/` for React 19, then `yarn workspace @lerx/promise-modal test:react18 src/__bounty__/r3-promise-modal/` for React 18.
  - Failing tests that are not findings:
    - `suspendingContent.render.test.tsx`, "reports what happens with no Suspense boundary above the Provider (diagnostic)": diagnostic. It passes on React 19 and fails only on React 18, where the request is rejected with "A component suspended while responding to synchronous input". It is a second symptom of the item about suspending content and is described there.
    - Under React 18, `activityProvider.render.test.tsx`, "keeps a static confirm pending while Activity hides and then shows its Provider" is skipped, because `Activity` exists only in React 19. This is an environment limit, not a failure.
  - Control tests that pass:
    - The Enter row of the Escape shortcut test.
    - Lazy content that brings its own Suspense boundary.
    - A static confirm across an ordinary rerender.
    - A manual modal settled while shown keeps its exit animation.
    - The light DOM rows of the slotted-root tests.
    - Top-down closing of a nested stack returns focus to the opener.
    - StrictMode and plain mounts give the same nested-flow result.
    - Hydration after `renderToString` reports no errors.
    - The README and specification examples run literally: `editName`, `nestedConfirmation` with both choices, the toast, and `RoutedApp`.
  - Verification limits specific to this package:
    - jsdom does not enforce `display: none` or flat-tree `inert` for focus. The focus and isolation items assert the library's own decisions and the final focused element. The browser-only intermediate states are reasoned from the HTML specification, not observed.
    - In the hydration test, the server render runs inside jsdom, where `window` exists. The module therefore selects `useLayoutEffect`, and React 18 warns during that render. The probe checks only the hydration for errors.

Root-cause files: `packages/lerx/promise-modal/`

## 1. When a modal's content suspends under a Suspense boundary that encloses the Provider, an unbounded update loop throws "Maximum update depth exceeded", unmounts the whole application root, and leaves every pending modal Promise unsettled forever.

- Severity: high. One request with code-split content, such as `React.lazy` or `use`, in an application with an app-level Suspense boundary blanks the entire page and strands every caller awaiting a modal. That configuration is common, for example a framework loading boundary or a router Suspense boundary.
- Affected public API: The `content`, `Input`, and `footer` options of `alert`, `confirm`, and `prompt`; a custom `ForegroundComponent` that suspends; `ModalProvider`; and `useInitializeModal`.
- Contract violated:
  - `packages/lerx/promise-modal/README.md:335` says that render failures in content, input, or a frame reject that request, and that peers and later requests continue working.
  - `packages/lerx/promise-modal/docs/en/SPECIFICATION.md:251` says that a presenter failure rejects and destroys only that modal, and that peers and future requests survive.
  - `packages/lerx/promise-modal/docs/en/SPECIFICATION.md:255` says that React 18 and 19 share the same public contract.
- Root cause:
  - `packages/lerx/promise-modal/src/bootstrap/BootstrapProvider/helpers/bootstrap.tsx:31-48` and `packages/lerx/promise-modal/src/components/Presenter/Presenter.tsx:33` place no Suspense boundary inside the portal. A suspension in a modal therefore suspends the nearest boundary above the Provider. React then hides the Provider and runs its layout effect cleanup.
  - That cleanup calls `ModalManager.detach` (`packages/lerx/promise-modal/src/bootstrap/BootstrapProvider/hooks/useInitialize.ts:45`). `detach` calls `notify(null)` (`packages/lerx/promise-modal/src/app/ModalManager.ts:190`), which clears the anchor and re-renders the Provider without the portal (`packages/lerx/promise-modal/src/bootstrap/BootstrapProvider/hooks/useInitialize.ts:29-31`).
  - With the suspending child gone, the boundary reveals the Provider again. Its layout effect re-attaches (`packages/lerx/promise-modal/src/bootstrap/BootstrapProvider/hooks/useInitialize.ts:36-44` and `packages/lerx/promise-modal/src/app/ModalManager.ts:174`), the portal renders the suspending content again, and the cycle repeats synchronously until React's nested update limit throws.
  - The nested update limit also exists in production React.
- Relation to earlier rounds: Sibling of `../round-2/lerx-promise-modal.md` item 5 and of the round 2 class "work done only in effects" (`../round-2/README.md`). There, a hide without an unmount runs effect cleanup. Here the trigger is a Suspense re-suspend that the modal's own content causes, and the cleanup belongs to the Provider bootstrap.
- Reopens an earlier fix: No.
- Reproduction: `suspendingContent.render.test.tsx`, "keeps a request whose code-split content suspends, and its peers, pending".
  - Actual result: the test catches "Maximum update depth exceeded". Afterwards neither the page nor the Suspense fallback is rendered, and both requests stay pending with two nodes in the store.
  - Expected result: no error, both requests stay pending, and the content renders once its chunk loads.
  - Both React 19 and React 18 fail.
  - A second symptom of the same missing boundary: when there is no Suspense boundary above the Provider at all, React 19 keeps the request pending and renders the content, while React 18 rejects the request with "A component suspended while responding to synchronous input". See the diagnostic test listed under PROBES.
- Confidence: high; public API.

## 2. Hiding the Provider, either because a Suspense boundary above it re-suspends or because `<Activity mode="hidden">` wraps it, cancels every pending request even though nothing was unmounted.

- Severity: medium. A pending `confirm` resolves `false` and a pending `prompt` resolves `null`, which discards its input, without any user decision. This happens when any sibling under the same Suspense boundary suspends during a synchronous update while a modal is open, or when a tab layout preserves the Provider's subtree with `Activity`.
- Affected public API: `ModalProvider`, `useInitializeModal`, and requests from the static `alert`, `confirm`, and `prompt` and from every `useModal` caller.
- Contract violated:
  - `packages/lerx/promise-modal/README.md:354` and `packages/lerx/promise-modal/docs/en/SPECIFICATION.md:149` cancel open requests only when the owner unmounts with no waiter.
  - `packages/lerx/promise-modal/README.md:234` says that static calls can outlive their caller and still follow Provider ownership.
- Root cause:
  - `packages/lerx/promise-modal/src/bootstrap/BootstrapProvider/hooks/useInitialize.ts:45` registers `ModalManager.detach` as a layout effect cleanup, so React runs it on a Suspense hide and on an `Activity` hide as well as on an unmount.
  - The microtask in `packages/lerx/promise-modal/src/app/ModalManager.ts:196-201` finds the generation unchanged, because re-attachment happens only when the subtree is shown again. It then calls `onDestroy` on every alive node.
  - `onDestroy` cancels each unsettled request (`packages/lerx/promise-modal/src/core/node/ModalNode/AbstractNode.ts:148-149`).
  - The same detach on hide drives the loop in item 1.
- Relation to earlier rounds: Adjacent to the decision on `../round-2/lerx-promise-modal.md` item 5.
  - That decision is recorded in `../round-2/FIXES.md`, "결정과 근거", the `@lerx/promise-modal` 5 entry, and documented at `packages/lerx/promise-modal/README.md:234`. It accepts that hiding a `useModal` caller with `Activity` cancels that caller's own requests, because React runs effect cleanup on hide.
  - The decision does not cover hiding the Provider itself. That case cancels static requests and requests owned by callers that stay visible.
  - The decision also does not cover a Suspense re-suspend, which needs no `Activity` and also occurs on React 18.
  - This is an owner decision: extend the round 2 decision and document it, or keep requests alive while the Provider is hidden.
- Reopens an earlier fix: No.
- Reproduction: `activityProvider.render.test.tsx`.
  - "keeps a static confirm pending while a sibling re-suspends the boundary above its Provider": the actual result is `false`, and the expected result is `undefined`, meaning still pending. It fails on React 19 and React 18.
  - "keeps a static confirm pending while Activity hides and then shows its Provider": the actual result is `false`, and the expected result is `undefined`. It runs on React 19 only.
  - The control "keeps a static confirm pending across an ordinary rerender" passes.
- Confidence: high for the behavior; public API. Whether this is the intended policy is an owner decision.

## 3. A modal opened by an Escape keydown handler is cancelled by the same Escape press, so `confirm` resolves `false` before the user ever sees it, while the same handler bound to Enter works.

- Severity: medium. An Escape shortcut that asks "Leave the editor?", or a prompt input that asks "Discard the note?" on Escape, silently never shows its confirmation. If the caller treats `false` as "do not keep editing", the user's input is discarded.
- Affected public API: Escape handling combined with a React keydown handler, or a document keydown listener registered before the Provider, that calls `alert`, `confirm`, or `prompt`.
- Contract violated:
  - `packages/lerx/promise-modal/README.md:327` and `packages/lerx/promise-modal/docs/en/SPECIFICATION.md:135` describe Escape as walking the visible pending modals and closing at most one per press.
  - The press began with no modal open, or only the prompt open, and an identical handler on another key keeps the modal open, which breaks the predictability requirement.
  - The sentence "otherwise the current list of modals is walked" in `packages/lerx/promise-modal/docs/en/SPECIFICATION.md:135` literally includes the new modal, so the contract reading is arguable.
- Root cause:
  - The capture partner in `packages/lerx/promise-modal/src/app/ModalManager.ts:387-390` records only the settlement count.
  - The bubbling handler in `packages/lerx/promise-modal/src/app/ModalManager.ts:404-412` walks the live store. That store already contains the node the handler registered synchronously (`packages/lerx/promise-modal/src/app/ModalManager.ts:55-91`), which is visible from construction (`packages/lerx/promise-modal/src/core/node/ModalNode/AbstractNode.ts:110`). The walk therefore closes the newest modal.
- Relation to earlier rounds: Sibling of `../round-1/lerx-promise-modal.md` item 5. That item recorded that nothing binds the Escape walk to the state before the event. Its fix counts settlements during the press but not registrations.
- Reopens an earlier fix: The root lines `packages/lerx/promise-modal/src/app/ModalManager.ts:404-413` were last changed by the round 1 promise-modal item 5 fixes, commits `4067b74f5` and `f2efae51f`. This is an input that fix does not cover. The fix's own regression test still passes.
- Reproduction: `escapeOpensModal.render.test.tsx`.
  - "keeps a confirm opened by a page Escape shortcut pending after the same press", Escape row: the actual result is that the new node is settled with `false`. The expected result is that it is pending. The Enter row passes.
  - "keeps a discard confirmation opened from a prompt Escape handler pending": the actual result is `false`, and the expected result is `undefined`.
  - Both tests fail on React 19 and React 18.
- Confidence: high for the behavior and medium for the contract; public API.

## 4. When one AbortSignal cancels a nested pair of dimmed modals, keyboard focus ends on the body instead of returning to the page control that opened the stack.

- Severity: low. Keyboard and screen reader users lose their place after a whole flow is cancelled by a shared signal. Closing the same stack from the top down returns focus correctly.
- Affected public API: The `signal` option of `alert`, `confirm`, and `prompt`, together with focus restoration.
- Contract violated:
  - `packages/lerx/promise-modal/docs/en/SPECIFICATION.md:193` says that one signal can cancel several requests.
  - `packages/lerx/promise-modal/docs/en/SPECIFICATION.md:139` says that focus returns to the connected opener after settlement.
  - The [WAI-ARIA dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/) says that focus returns to the invoking element when a dialog closes.
- Root cause:
  - Abort listeners run in registration order, so the outer modal settles first.
  - Focus is still inside the nested modal, so `packages/lerx/promise-modal/src/app/ModalManager.ts:252-267` skips the outer restoration and drops the page opener.
  - The nested modal's restoration (`packages/lerx/promise-modal/src/app/ModalManager.ts:268-275`) then focuses its recorded opener. That opener is a control inside the outer frame, which has just lost its display class (`packages/lerx/promise-modal/src/components/Foreground/Foreground.tsx:48-54`) and unmounts after the automatic destruction delay, so focus falls to the body.
  - The documented limit "a disconnected opener is ignored" assumes that the opener is gone. Here the stack's real opener is connected and is discarded.
- Relation to earlier rounds: Sibling of `../round-1/lerx-promise-modal.md` item 8.
- Reopens an earlier fix: No. The restoration lines were last changed by the round 1 item 8 fixes (`1ebb17eb1`, `8f0558993`) and the round 2 item 1 and 3 fixes (`322900929`, `3b679874b`), but this is a different input, not a regression.
- Reproduction: `sharedSignalFocus.render.test.tsx`, "returns focus to the page opener after one shared signal cancels a nested stack".
  - Actual result: `document.activeElement` is the body.
  - Expected result: the "Review" button.
  - The control "returns focus to the page opener when the stack closes top-down" passes.
- Confidence: medium to high; public API in jsdom. A browser refuses the intermediate focus on the hidden control at once, whereas jsdom accepts it until the frame unmounts. The final state is the same in both.

## 5. A `manualDestroy` modal that was hidden by a route change and then settles while hidden is displayed again on the new route for its exit duration.

- Severity: low. With the README's animated frame and `useModal`, leaving the page unmounts the caller, which cancels the request. The still opaque dialog is then shown on the new route until destruction, and its controls stay in the Tab order.
- Affected public API: The `manualDestroy` option combined with `usePathname` or the default pathname hook, and abort or `useModal` cleanup of a hidden request.
- Contract violated:
  - `packages/lerx/promise-modal/README.md:354` says that a settled modal never reappears, including in manual destruction mode.
  - `packages/lerx/promise-modal/docs/en/SPECIFICATION.md:139` says that route hiding releases participation immediately.
- Root cause:
  - `packages/lerx/promise-modal/src/components/Foreground/Foreground.tsx:51-53` and `packages/lerx/promise-modal/src/components/Background/Background.tsx:43-45` add the display class whenever `manualDestroy && settled && alive`. They do not consider whether the node was route-hidden when it settled.
  - Abort and caller cleanup, which hidden requests still honor according to `packages/lerx/promise-modal/README.md:354`, satisfy that condition.
- Relation to earlier rounds: Sibling of `../round-2/lerx-promise-modal.md` item 2.
- Reopens an earlier fix: Round 2 promise-modal item 2, commit `3922b4436`. The fix narrowed the exit-animation branch to settled nodes, but a node that settles while route-hidden still matches it.
- Reproduction:
  - `routeHiddenSettle.render.test.tsx`, "does not display a route-hidden manualDestroy modal again when it settles while hidden": the actual result is that the wrapper has the display class, and the expected result is that it does not. The control "keeps a modal settled while shown displayed for its manual exit animation" passes.
  - `routeLeaveAnimatedFrame.render.test.tsx`, "keeps a useModal request off the next route when leaving the page cancels it", using the README frame verbatim: the actual result is `{ displayed: true, opacity: '1' }`, and the expected result is not displayed.
  - Both fail on React 19 and React 18.
- Confidence: high; public API.

## 6. When the modal root is a light DOM child that a web component host renders through a slot, controls in that host's shadow tree are not made inert behind a dimmed modal, unlike the equivalent light DOM layout.

- Severity: low. Screen reader users, and keyboard users with `trapFocus: false`, can reach shell controls in the shadow tree, such as a toolbar button or a disclosure header, while a dimmed modal is open.
- Affected public API: The `root` prop of `ModalProvider`, `useInitializeModal`, and `initialize(element)` with a slotted root.
- Contract violated:
  - `packages/lerx/promise-modal/docs/en/SPECIFICATION.md:141` describes isolation of siblings along the anchor's ancestor path up to the body.
  - `packages/lerx/promise-modal/src/app/DETAIL.md:11` requires the same isolation boundary for light DOM and shadow DOM roots.
  - `packages/lerx/promise-modal/README.md:329` says that dimmed modals isolate the page.
- Root cause:
  - `packages/lerx/promise-modal/src/app/ModalManager.ts:320-334` climbs light DOM `parentElement` links and crosses to a shadow host only when the branch's parent is a shadow root.
  - A slotted root's flat-tree ancestors, namely the slot and its siblings in the host's shadow tree, are never visited, so they receive no `inert` attribute.
- Relation to earlier rounds: Sibling of `../round-2/lerx-promise-modal.md` item 1, which covered a root inside a shadow root.
- Reopens an earlier fix: No. The walk was last changed by the round 2 item 1 fixes (`59fafa8a0`, `a0c1b6c89`), and this layout is a gap those fixes did not address, not a regression.
- Reproduction: `slottedRoot.render.test.tsx`, "isolates the shell toolbar beside the modal root (shadow chrome=true)".
  - Actual result: no composed ancestor of the shadow toolbar is inert.
  - Expected result: it is isolated, as the light DOM row is. The `shadow chrome=false` row passes.
  - Both React versions fail.
- Confidence: medium to high; public API in jsdom. Neither jsdom nor a browser sees an inert ancestor for the toolbar, because the host itself is an ancestor of the anchor.

## 7. Running the `useInitializeModal` JSDoc example literally prints the development warning "FooterComponent is fixed at mount; pass changing data through context instead."

- Severity: low. A developer who copies the published example gets a console warning on first mount and is told to change code that the documentation itself wrote.
- Affected public API: The JSDoc of `useInitializeModal`, shipped in `packages/lerx/promise-modal/dist/bootstrap/BootstrapProvider/useBootstrap.d.ts`.
- Contract violated: `packages/lerx/promise-modal/README.md:136` says that component identity changes are ignored and warn once per prop. The example creates such a change.
- Root cause:
  - The example in `packages/lerx/promise-modal/src/bootstrap/BootstrapProvider/useBootstrap.tsx:25-31` passes an inline arrow function as `FooterComponent`.
  - After attachment, `packages/lerx/promise-modal/src/bootstrap/BootstrapProvider/hooks/useInitialize.ts:29-31` re-renders the caller, which creates a new function identity.
  - `packages/lerx/promise-modal/src/bootstrap/BootstrapProvider/hooks/useInitialComponents.ts:26-38` warns about the new identity.
- Relation to earlier rounds: Same class as round 1 class 19, "documented examples or configurations that do not work" (`../round-1/README.md`).
- Reopens an earlier fix: No.
- Reproduction: `jsdocExamples.render.test.tsx`, "runs the useInitializeModal JSDoc example without development warnings".
  - Actual result: one warning about `FooterComponent`.
  - Expected result: no warnings.
  - Both React versions fail.
- Confidence: high; public API and built declarations.

## Hypotheses checked and not bugs

- From `r3-contracts`:
  - The CommonJS bundle places `'use client'` before `"use strict"` in its directive prologue, and the `sideEffects` list matches the single-file ESM and CommonJS bundles.
  - `SKILL.md:62` says the duration hooks "return normalized ms strings", but `SKILL.md:58` defers shapes to the declarations, and `README.md:280` and `docs/en/SPECIFICATION.md:79` and `:119` show the `{ duration, milliseconds }` object, so a reader is not led to misuse `useModalDuration`.
  - The CommonJS TypeScript gap of [@winglet/common-utils item 6](winglet-common-utils.md) is documented for this package (`docs/en/SPECIFICATION.md:257`), so it is excluded there.
- From `r3-promise-modal`:
  - A nested prompt-over-confirm flow under StrictMode gives the same focus, Escape, inert, overflow, and result outcome as a plain mount on React 18 and React 19.
  - Hydrating a server-rendered Provider reports no hydration errors, and modals open and settle afterwards.
  - The README examples `editName` and `nestedConfirmation`, the specification toast, and `RoutedApp` work when executed literally. The toast closes after three seconds while peer modals publish, because the frame's `onClose` identity is stable.
  - With the root inside a shadow root and a slotted page opener, the library does not see the opener as inert. The next foreground layout effect still moves focus into the remaining dimmed modal, so the outcome matches light DOM.
  - A wizard pattern that opens the next modal and closes the current one in the same handler leaves focus on the body after the closed modal is destroyed. This matches the documented limit in `packages/lerx/promise-modal/docs/en/SPECIFICATION.md:139` that a disconnected opener is ignored when no dimmed modal remains.
  - Two providers under StrictMode's double effects converge to the same owner and waiter as without StrictMode.
