# @lerx/promise-modal: bug bounty round 5

1 new finding in `@lerx/promise-modal`, low. Items in the documents of [round 1](../round-1/lerx-promise-modal.md), [round 2](../round-2/lerx-promise-modal.md), [round 3](../round-3/lerx-promise-modal.md) and [round 4](../round-4/lerx-promise-modal.md) were treated as fixed and excluded, together with the decisions and known limits of each round's `FIXES.md`. The main session re-ran every probe on React 19 and React 18: the `r5-style-react-modal` folder ran 3 tests, of which 1 fails, on each version. The item is a regression of a round 4 fix, with a contract caveat, and repeats the watch-list point on hidden and `<Activity>` requests. [Item 6 of canard-schema-form.md](canard-schema-form.md) also affects this package's root declarations (14 occurrences).

Probes: [probes/lerx-promise-modal/](probes/lerx-promise-modal/)

- Copy a folder back to `packages/lerx/promise-modal/src/__bounty__/<hunter-id>/` and run `yarn workspace @lerx/promise-modal test --run src/__bounty__/<hunter-id>/` for React 19 and `yarn workspace @lerx/promise-modal test:react18 src/__bounty__/<hunter-id>/` for React 18.
- In `focusRule.r5.render.test.tsx`, M2 and M3 pass: moving the root while focus is inside, and detaching then reattaching with `root={null}`, return focus to the opener. `r5-rerun-others/shadowStyles.render.test.tsx` passes on both versions.
- Earlier probes re-run (`r5-rerun-others`): round 1 ran 12 tests on each React version (0 fail); round 2 18 (2 fail on React 19, 4 on React 18); round 3 27 (1 fail on each, 1 skipped on React 18); round 4, with its own configurations, 35 (2 fail on each, 7 skipped on React 18). Every failure has a role: the round 2 item 5 decision that a hidden request is cancelled, the round 2 item 1 design that styles a shadow-root anchor only in its own tree (the old probe also required document styles), environment limits on React 18 (`Activity` is undefined, and the CommonJS `dist` requires the root React 19), a round 3 item 7 assertion of JSDoc text that the documentation fix changed, and the round 4 item 5 decision on incompatible copies. No earlier item regressed.

Root-cause files: `packages/lerx/promise-modal/src/app/`

## 1. A displayed, dimmed request aborted while its content is suspended leaves focus on the document body instead of returning it to the opener.

- Severity: low. While the content is suspended the page stays inert, and after the abort focus is not returned to the element that opened the request; the same abort with the content shown returns it.
- Affected public API: `alert`, `confirm` and `prompt` with a `signal` (or a `useModal` cleanup) and a suspending `content`, `Input` or `footer`, on React 18 and 19.
- Contract violated: `docs/en/SPECIFICATION.md:139` (focus returns to the opener when the request is displayed and owns focus, and focus that fell to the body counts as owned; the exclusions do not include suspended content) and `:137`; `src/app/DETAIL.md:5` (the focus record survives content re-suspension); predictability against the same abort with the content shown.
- Root cause: `src/app/ModalManager.ts:76` requires `node.isVisibleAtSettlement !== false`, and `isDisplayed(id)` (`:295-299`) needs the frame element, which the presenter's Suspense boundary detaches while the content is suspended; `updateAccessibility` keeps the node in `visibleNodes()`, so the page stays inert. The same check sits in `detach` at `:243`.
- Relation to earlier rounds: round 4 items 1 and 4; round 4 class 35.
- Reopens an earlier fix: round 4 items 1 and 3; `git log -L 70,78` shows `915111032`, `c83de7d16` and `4a8db653a`.
- Regression of an earlier fix: yes, case (b), with a caveat: round 4 `@lerx/promise-modal` items 1 and 3, commit `915111032` ("capture connected content at settlement"), which added `node.isVisibleAtSettlement !== false` to the restore condition and the frame check to `isDisplayed(id)`. The main session read that diff: before it the condition held for this input and focus returned to the opener. The caveat is that the round 4 decision lists content re-suspension among the states it compares, so the owner may decide that suspended content counts as not displayed; in that case this is a documentation gap in `SPECIFICATION.md:139`, not a code defect.
- Watch list: yes, hidden and `<Activity>` requests.
- Reproduction: `r5-style-react-modal/focusRule.r5.render.test.tsx`, M1, "a displayed request whose content re-suspended, then aborted returns focus to the opener, as the same abort does with the content shown": with the content shown, `{ result: false, focusOnOpener: true }`; suspended, `{ pageInertWhileLoading: true, focusOnOpener: false, focusOnBody: true }`. It fails on React 19 and 18.
- Confidence: high for the behavior; medium for the reading of the contract.

## Hypotheses checked and not bugs

- An incompatible copy's `open` throws only after its Provider attaches; otherwise requests stay queued, as documented.
- The modal's own styles are plain class rules, so [winglet-style-utils item 1](winglet-style-utils.md) does not reach them (static).
- Focus in the top modal's external portal moving into its first control when a lower modal settles follows the decided rule.
- A shadow-root anchor gets its styles in its own tree and none in the document, as the round 2 item 1 design states.
