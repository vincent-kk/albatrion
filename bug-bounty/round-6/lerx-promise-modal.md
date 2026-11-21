# @lerx/promise-modal: bug bounty round 6

1 new finding in `@lerx/promise-modal`, low. Items in the documents of [round 1](../round-1/lerx-promise-modal.md), [round 2](../round-2/lerx-promise-modal.md), [round 3](../round-3/lerx-promise-modal.md), [round 4](../round-4/lerx-promise-modal.md) and [round 5](../round-5/lerx-promise-modal.md) are treated as fixed and excluded, together with their decisions and known limits. The main session re-runs every probe: `r6-style-react-modal` runs 3 tests under React 19, of which 1 fails, and 3 under React 18, of which 1 fails and 1 skips. The cross-package release folder hosted in common-utils runs 56 passing tests and includes this package's runtime and declaration surfaces. Item 1 reopens an earlier fix without being a regression and repeats the suspended-request watch point below the medium threshold.

Probes: [probes/lerx-promise-modal/](probes/lerx-promise-modal/)

- Copy `r6-style-react-modal` back to `packages/lerx/promise-modal/src/__bounty__/r6-style-react-modal/`. Run `yarn workspace @lerx/promise-modal test --run --config src/__bounty__/r6-style-react-modal/vitest.config.ts src/__bounty__/r6-style-react-modal/ownerSequence.test.tsx` for React 19, and replace the configuration with `src/__bounty__/r6-style-react-modal/vitest.react18.config.ts` for React 18. Both configurations select source aliases; rendering uses jsdom rather than a real browser.
- Both failures establish item 1. M1's connected-stack control restores focus correctly. M2's Activity survival check passes on React 19 and skips on React 18 because Activity does not exist there; M3's surviving waiter/owner-unmount check passes on both versions.
- The main session's earlier-probe re-run for this package records 96 tests and 6 failures under the default configurations, including the round 4 folders, without an original fixed-input regression. Modal failures represent the hidden-request, shadow-local-style and corrected JSDoc decisions, refusal of incompatible independent copies, and a source-resolution diagnostic whose invalid `compressCss(null)` stack assumption no longer holds. The existing round 5 suspended displayed-modal focus rule passes. Release probes and their command are hosted in [common-utils](winglet-common-utils.md).

Root-cause files: `packages/lerx/promise-modal/src/app/ModalManager.ts` and `packages/lerx/promise-modal/src/components/Foreground/Foreground.tsx`

## 1. Shared-signal cancellation of a nested stack loses the page opener when lower content re-suspends.

- Severity: low. Focus lands on the body instead of the connected page control, although both promises settle and page effects release. The hunter rates this medium; the final rating is low to match the focus-restoration severity of [round 5 promise-modal item 1](../round-5/lerx-promise-modal.md).
- Affected public API: `confirm` with `signal` and suspending `content`; the manager machinery also serves `alert` and `prompt`.
- Contract violated: `packages/lerx/promise-modal/docs/en/SPECIFICATION.md:139` defines connected-opener restoration, pending-peer protection and remaining-dialog fallback. The shared-signal decision in `../round-3/FIXES.md:129` requires cancellation of both nested dimmed requests to restore the page opener. The suspended-modal specification row at `../round-5/FIXES.md:388` is relevant to the fix session; its original displayed-modal input still passes.
- Root cause: `packages/lerx/promise-modal/src/app/ModalManager.ts:80-89` propagates the closing request's page opener only while its frame remains registered. Suspense detaches the reference through `packages/lerx/promise-modal/src/components/Foreground/Foreground.tsx:21-24`, and `packages/lerx/promise-modal/src/app/ModalManager.ts:290` deletes that temporary frame registration while its request/opener relationship remains alive. Lower settlement deletes the page-opener record without rebasing the upper request, whose opener disappears with the lower dialog.
- Relation to earlier rounds: [round 3 promise-modal item 4](../round-3/lerx-promise-modal.md) and [round 4 promise-modal item 4](../round-4/lerx-promise-modal.md), with the frame owner disappearing before settlement; the ordinary connected-frame propagation still works.
- Reopens an earlier fix: [round 3 promise-modal item 4](../round-3/lerx-promise-modal.md), commit `738fa432b`.
- Regression of an earlier fix: no. Source comparison shows that `738fa432b` adds propagation conditional on the same frame record absent here, while its parent has no propagation. The newly suspended input has no demonstrated earlier correct result; the original connected-stack input passes.
- Watch list: yes, hidden, suspended and Activity requests, below the medium threshold for another-round counting.
- Reproduction: `r6-style-react-modal/ownerSequence.test.tsx`, "M1 shared cancellation with a suspended lower owner restores like the connected stack" opens a lower confirm from the page, an upper confirm from a real lower-dialog control, re-suspends lower content and aborts their shared signal. The connected control gives `{ results: [false, false], restored: true, inert: false, count: 0 }`; the suspended input gives the same values except `restored: false`, expected `true`, on both React versions.
- Confidence: high for the public-source reproduction under React 19 and 18 in jsdom; medium-high for the opener-chain diagnosis. Real-browser focus rendering is not verified.

## Hypotheses checked and not bugs

- A request survives two Activity hide/reveal cycles, releases and reacquires page isolation and restores its original opener on abort under React 19.
- After an owner unmounts, a surviving waiter displays the pending request in its own root, settles with Escape and releases scroll locking after teardown on React 19 and 18. This also exercises source style-utils cleanup integration.
- The connected nested stack restores focus correctly; the new finding requires lower-frame re-suspension before shared cancellation.
- Current built public targets and supported strict declaration consumers pass release checks. The release review does not independently certify modal behavior or install the oldest complete React type package.

## Open leads

- The round 5 oldest-complete-React-types compatibility lead remains open because the release review checks installed supported profiles without installing historical type packages.
