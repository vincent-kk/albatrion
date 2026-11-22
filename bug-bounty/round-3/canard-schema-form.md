# @canard/schema-form: bug bounty round 3

This round confirmed 17 new findings in `@canard/schema-form`. Items in the earlier round documents ([round 1](../round-1/canard-schema-form.md), [round 2](../round-2/canard-schema-form.md)) were treated as fixed and excluded. The main session re-ran every probe. Verification limits are listed under the probes.

Probes: [probes/canard-schema-form/](probes/canard-schema-form/)

- From `r3-react`:
  - Probe folder in the working tree: `packages/canard/schema-form/src/__bounty__/r3-react/`; the round copy is `bug-bounty/round-3/probes/canard-schema-form/r3-react/`.
  - To run the copy: copy it back to `packages/canard/schema-form/src/__bounty__/r3-react/` and run `yarn workspace @canard/schema-form test --run --project render src/__bounty__/r3-react/` for React 19 and `yarn workspace @canard/schema-form test --run --project react18 src/__bounty__/r3-react/` for React 18. Every item below fails the same way in both projects.
  - Failing tests that are not findings:
    - `portalForm.test.tsx`, test "focus and blur inside a dialog Form leave the touched state of the field that opened it": diagnostic. A blur inside a dialog Form that a FieldInput renders through a portal marks that outer field touched after one frame (`isTouched` is true, `isEdited` stays false). It shares the mechanism of item B, React event propagation through a portal, but a different handler runs: `handleBlur` at `packages/canard/schema-form/src/components/FieldProxy/components/FieldInputBridge/FieldInputBridge.tsx:200`, bound to the input container's `onBlur` at line 238. Fixing item B therefore does not make it pass. It is not reported, because interaction inside a dialog that the field itself opened can reasonably count as touching that field, and no contract forbids it.
  - Control tests that pass:
    - `radioGroupName.test.tsx`: a single radio field shows its loaded selection.
    - `contextContent.test.tsx`: a plain string change in context recomputes `visible`. The diagnostic test "engine setContext with a new URLSearchParams recomputes visible" passes and shows that the engine itself recomputes.
    - `jsdocExamples.test.tsx`: `format: 'password'` in the schema renders a masked input.
    - `portalForm.test.tsx`: the outer Form keeps its validation state when the outer form is invalid and in OnRequest mode.
    - `shadowRoot.test.tsx`, `unmountCleanup.test.tsx`, `lateInputCallbacks.test.tsx`, `siteExamples.test.tsx` and `propOwnership.test.tsx` pass completely; see HYPOTHESES.
  - Verification limits:
    - All probes run in jsdom through the public API from source, not from `dist`. The diagnostic in item D also calls the internal function `setContext`.
    - Environment limit: jsdom does not implement keyboard navigation inside a radio group. The arrow-key risk named in item C therefore has no probe and was not checked in a real browser.
    - Focus handling under virtualization inside a shadow root was checked only by reading the code.
- From `r3-compile`:
  - Probe folder in the working tree: `packages/canard/schema-form/src/__bounty__/r3-compile/`; the round copy is `bug-bounty/round-3/probes/canard-schema-form/r3-compile/`.
  - To run the copy: copy it back to `packages/canard/schema-form/src/__bounty__/r3-compile/` and run `yarn workspace @canard/schema-form test --run --project unit src/__bounty__/r3-compile/` for the `.test.ts` files, then `yarn workspace @canard/schema-form test --run --project render src/__bounty__/r3-compile/` and the same command with `--project react18` for the `.test.tsx` files.
  - Three probe files write diagnostic records to `os.tmpdir()/r3-compile-diag.jsonl`: `refBranches.test.ts`, `derivedNumbers.test.ts` and `refFieldsControls.test.ts`. They write nowhere else.
  - Failing tests that are not findings:
    - `childNameContexts.test.ts`, "discriminator names the literal tag property": rejected hypothesis. Only the empty name `''` fails, with `INVALID_CONTROL_SHAPE`, and the documents require a nonempty discriminator name.
    - `documentedClaims.test.ts`, "status after remove, then an unrelated write, then push": diagnostic for item 8. It shows that the degraded status stays after the list is refilled and after an unrelated write.
  - Mapping of every other failing test to its item:
    - item 3: `refFieldsOuterPath.test.ts` O1, O2, O4, O10, O11 and O13; `refFieldsControls.test.ts` F4; `refActiveOuterPath.test.tsx` "turning off the second referrer condition removes its value from getValue, as the inline schema does".
    - item 3 and item 4 together: `refFieldsOuterPath.test.ts` O9 and C1; `refActiveOuterPath.test.tsx` "turning on the second referrer condition adds its field, as the inline schema does" and "a context change activates the field at both referrers, as the inline schema does". These schemas contain only `active` controls and turn a field on from off, so both causes apply.
    - item 4: `refFieldsOuterPath.test.ts` C4, D5 and D6; `refActiveOuterPath.test.tsx` "the context change still misses the second referrer when an unrelated visible control builds the occurrence index" and "turning on the second referrer condition adds its field even with an unrelated visible control".
    - item 8: `collectionGateExample.test.tsx` "removing the last item neither throws nor blocks submission"; `documentedClaims.test.ts` "(../items).length > 0 on an empty list reports no expression failure", "remove(0) of the last item", "setValue([]) on the array" and "clear()".
    - item 15: both tests in `embeddedIdBase.test.ts` except the AJV reference test.
  - Control tests that pass:
    - `refFieldsOuterPath.test.ts` D1, D2, D3 and D4: an unrelated `visible` or `derived` control makes the turn-off cases of item 3 pass.
    - `refFieldsOuterPath.test.ts` D7: turning off a present field through context works once the occurrence index exists.
    - `refFieldsOuterPath.test.ts` O3 (single referrer), O5, O6 and O7 (`visible`, `readOnly` and `derived` with an outer path), O8 (writes at the first referrer), O12 (`oneOf` branch gates with an outer path), E1 and E2 (`unsetValue` and `resetInteraction`), C2, C3 and C5 (`visible`, `readOnly` and `derived` reading context), C6 (single referrer reading context) and A1 (one array whose items read the array owner).
    - `refActiveOuterPath.test.tsx` "control: the same $ref schema reacts once an unrelated visible control exists".
    - `collectionGateExample.test.tsx` "a form loaded with an empty list submits" and "control: the optional-chaining spelling removes the last item cleanly".
    - The AJV reference test in `embeddedIdBase.test.ts`.
  - Verification limits:
    - The `.test.ts` probes build trees with the internal fixture `packages/canard/schema-form/src/__tests__/fixtures/nodeFromJSONSchema.ts`, which uses the same build channel as `<Form>`. item 3, item 4 and item 8 are also confirmed through the public `Form` and `FormHandle` in React 19 and React 18. item 15 is confirmed only through the internal fixture.
    - The angle list named `docs/en/SPECIFICATION.md`, which no longer exists; it was merged into other documents in pull request 549. The documented-example checks used the files under `packages/canard/schema-form/docs/agents/skills/schema-form-skill/knowledge/`, `documents/docs/canard/schema-form/schema-reference.mdx` and the controls expressions in the documentation site demos under `documents/src/components/demos/`.
- From `r3-engine`:
  - Probe folder in the working tree: `packages/canard/schema-form/src/__bounty__/r3-engine/`; the round copy is `bug-bounty/round-3/probes/canard-schema-form/r3-engine/`.
  - To run the copy: copy it back to `packages/canard/schema-form/src/__bounty__/r3-engine/` and run `yarn workspace @canard/schema-form test --run --project unit src/__bounty__/r3-engine/` for the `*.test.ts` files, and `yarn workspace @canard/schema-form test --run --project render src/__bounty__/r3-engine/objectWholeInput.test.tsx` for the one render file. Diagnostics are appended to `r3-engine-diag.log` in the operating system temporary directory.
  - Failing tests that are not findings: `explore2.test.ts` test "H4 a repeated cleanup call does not remove a newer subscription" is a diagnostic duplicate of item E. `explore2.test.ts` test "H5 the same listener subscribed twice survives one cleanup" is a rejected hypothesis: one function subscribed twice is stored once in a set, so one cleanup removes it, which matches the semantics of the DOM `EventTarget`.
  - Control tests that pass: `batchMerge.test.ts` M0 (a single nested Merge write inside a batch); `subscriptionCleanup.test.ts` S2 (the `onInactive` cleanup is idempotent); `explore1.test.ts` (throwing listeners, listener set changes during delivery, throwing `derived`, numbers through `derived` and `setValue`); `explore2.test.ts` H1, H2, H3, H7, H8 and H9; `failurePaths.test.ts`; `globalState.test.ts`; `indexEdges.test.ts`; `listenerWriteback.test.ts`; `revisionObservation.test.ts`; `writeShapeDifferential.test.ts`; `objectWholeInput.test.tsx`.
  - Verification limits: every probe calls the public `FieldNode` methods (`batch`, `visitSubtree`, `setValue`, `resetSubtree`, the array methods, `subscribe`, `onInactive`) on trees built through `buildFieldNodeTree` and `mountFieldNode`, which is the channel `<Form>` uses; `probeHelpers.ts` holds that setup. Only `objectWholeInput.test.tsx` renders `<Form>`. The overtaking of asynchronous validation by `reset` or by a write (angle LC1) was checked by reading the code only.
- From `r3-validation`:
  - Probe folder in the working tree: `packages/canard/schema-form/src/__bounty__/r3-validation/`; the round copy is `bug-bounty/round-3/probes/canard-schema-form/r3-validation/`.
  - To run the copy: copy it back to `packages/canard/schema-form/src/__bounty__/r3-validation/` and run `yarn workspace @canard/schema-form test --run --project unit src/__bounty__/r3-validation/`. A single file runs with the same command and the file path appended, for example `src/__bounty__/r3-validation/reentrantValidator.test.ts`.
  - Failing tests that are not findings:
    - `specialNames.test.ts`, 18 failures, rejected hypothesis. The six `__proto__` rows fail because AJV deliberately skips a `__proto__` key in `properties`. The twelve `required` rows for `constructor`, `toString`, `hasOwnProperty` and `valueOf` report `type` instead of `required` because AJV's default `ownProperties: false` lets the inherited member satisfy `required`. Plain AJV gives the same results for both, so the plugins and the form add nothing.
    - `protoDiag.test.ts`, "[diagnostic] __proto__ field value and verdict", diagnostic. It shows that the form keeps `__proto__` as an own key in the emitted value and that plain AJV 8 also reports no error for it.
    - `reentrantValidator.test.ts`, "[diagnostic] a same-value setValue outside validation and its commit/stamp counters", diagnostic for item A. It shows `commitNumber` rising from 1 to 2 while the root value keeps its identity.
    - `manyIssues.test.ts`, "[measurement] AJV8 form validation of a terminal array with 20k invalid rows", measurement for item B: 29.5 ms for 5,000 rows and 523.6 ms for 20,000 rows, a ratio of 17.7.
    - `unionSpecialNames.test.ts`, 30 failures, rejected hypothesis. The `kind` field shows the inactive branch's `const` issue for the plain name too, so the expectation was wrong for this schema shape. The AJV 8 compile failure for the `$id` `urn:r3:a~b:id` also happens in plain AJV ("URN without nid cannot be serialized").
  - Control tests that pass: "routes every issue of a large terminal array to that array node" and "[control] unroutable issues of the same count scale linearly" in `manyIssues.test.ts`; "[control] a validator that writes only when the value differs settles" and "a synchronous validator reading the form handle during the run sees the validated value" in `reentrantValidator.test.ts`; the `ajv7` and `ajv8` rows of `dynamicKeyRouting.test.ts`; all 150 other rows of `specialNames.test.ts`; all three rows of `deepData.test.ts`.
  - Verification limits: the probes build trees with the internal fixture `src/__tests__/fixtures/nodeFromJSONSchema.ts`, which the package `CLAUDE.md` describes as the same build path that `<Form>` uses; no probe renders `<Form>`. The built `dist` of the three AJV plugins predates the round 2 fixes, so the probes import the plugin sources by relative path (`../../../../schema-form-ajv8-plugin/src/default/index` and the like); only the measurement test in `manyIssues.test.ts` imports `@canard/schema-form-ajv8-plugin`, which resolves to that older `dist`. Item B is a timing measurement and its absolute numbers depend on the machine.
- From `r3-contracts`:
  - Probe folder in the working tree: `packages/canard/schema-form/src/__bounty__/r3-contracts/`; the round copy is `bug-bounty/round-3/probes/canard-schema-form/r3-contracts/`.
  - To run the copy: copy it back to `packages/canard/schema-form/src/__bounty__/r3-contracts/` and run `yarn workspace @canard/schema-form test --run --project render src/__bounty__/r3-contracts/twoBundlesRegistry.test.tsx` for item A, and `yarn workspace @canard/schema-form test --run --project unit src/__bounty__/r3-contracts/react18Types.test.ts` for the rejected hypothesis below.
  - Failing tests that are not findings: under the `react18` project, all three tests in `twoBundlesRegistry.test.tsx` fail, the control included, because `vi.resetModules()` leaves the aliased React 18 copy with a null dispatcher. This is an environment limit, so only the `render` run (React 19) is evidence for item A.
  - Control tests that pass: "control: a single bundle renders its own registered plugin" in `twoBundlesRegistry.test.tsx`; the whole of `react18Types.test.ts`, including its checks that the React 18.3 typings and more than 50 published declaration files were loaded.
  - Verification limits: the local `dist` predates the round 2 fixes and does not contain the shared registry, so item A is reproduced against the package source loaded twice through `vi.resetModules()`, which stands in for two independently built bundles. `react18Types.test.ts` reads the stale `dist` declarations.

Root-cause files: `packages/canard/schema-form/src/`

## 1. When two Forms on one page share a field path, clicking a label or a radio option text in the second Form changes the value of the first Form.

- Severity: high. Pages that place sibling Forms with overlapping fields (shipping and billing addresses, one Form per row) silently write the user's choice into the wrong, independent Form, while the Form the user clicked stays unchanged. Screen readers also announce the other Form's input as the label target.
- Affected public API: every built-in field input (string, number, boolean, date, enum select, radio group, checkbox group), the bound `Label` that a FieldRenderer receives, `Form.Label`, and the `legend` of the default FieldRenderer.
- Contract violated:
  - `packages/canard/schema-form/docs/agents/skills/schema-form-skill/knowledge/imperative-and-layout.md:73` recommends sibling Forms under FormProvider for independent forms.
  - Line 70 of the same file states that each Form is a separate tree.
  - The [HTML Living Standard requires an `id` value to be unique in its element's tree](https://html.spec.whatwg.org/multipage/dom.html#the-id-attribute).
  - `packages/canard/schema-form/docs/agents/skills/schema-form-skill/knowledge/field-input.md:159` and `documents/docs/canard/schema-form/api-reference.mdx:103` document that a Label's `htmlFor` equals the field path. That single-form scheme is deliberate, but neither document addresses more than one Form on a page.
- Root cause: element ids come from `node.path` alone, with no per-Form scope.
  - Inputs: `packages/canard/schema-form/src/fieldInputs/fieldInputDefinitions/FieldInputString/FieldInputString.tsx:35` (also `FieldInputNumber.tsx:33`, `FieldInputBoolean.tsx:32`, `FieldInputDateFormat.tsx:36`, `FieldInputStringEnum.tsx:83`).
  - Option ids and group labels: `FieldInputStringRadio.tsx:58` and `:62`, and `FieldInputStringCheckbox.tsx:71` and `:75`.
  - Labels: `packages/canard/schema-form/src/components/FieldProxy/utils/parts/createLabelPart.tsx:39-40` and `packages/canard/schema-form/src/components/FallbackComponents/components/FieldRenderer.tsx:37`.
  - A label's `for` attribute resolves to the first element with that id in the document, which belongs to the first Form. Label activation therefore clicks the first Form's control.
- Relation to earlier rounds: New class (identifier scope shared across component instances). It is related to `../round-2/canard-schema-form.md` item 10, which concerned `Form.Label` with query paths and has a different mechanism.
- Reopens an earlier fix: No.
- Reproduction: `siblingFormIds.test.tsx`.

  | Test | Actual | Expected |
  |---|---|---|
  | "clicking a radio option text in the second Form selects that option in the second Form" | `{ first: { plan: 'pro' }, second: {} }` | `{ first: {}, second: { plan: 'pro' } }` |
  | "clicking the boolean field label in the second Form toggles the second Form" | `{ first: { agree: true }, second: {} }` | `{ first: {}, second: { agree: true } }` |
  | "each sibling Form label labels the input of its own Form" | The label's `control` is the first Form's input | The second Form's input |
  | "ids rendered by two sibling Forms are unique in the document" | Duplicate ids `['label:/email', '/email', 'label:/plan', '/plan-0', '/plan-1']` | No duplicates |
  | "the radio group of the second Form is labelled by its own field title" | `aria-labelledby` resolves into the first Form | Resolves into the second Form |

- Confidence: high for the behavior and medium that the owner treats it as a bug, because the id scheme is documented for a single Form. Verified through the public API.

## 2. Submitting a Form rendered through a portal inside another Form, such as a dialog, also submits the outer Form, and the outer `onSubmit` receives a value from before the dialog wrote its result.

- Severity: high. In an application that opens a dialog with its own Form from inside a Form (Ant Design Modal and MUI Dialog render through portals by default), the dialog's submit button or Enter key also validates and submits the outer Form. The outer `onSubmit`, typically a save request, runs when the user did not ask for it, and its value lacks what the dialog was about to write.
- Affected public API: native submission of `Form` (`<form onSubmit>`), the `onSubmit` prop, and the outer Form's error reveal and first-invalid focus.
- Contract violated:
  - `packages/canard/schema-form/docs/agents/skills/schema-form-skill/knowledge/imperative-and-layout.md:69-70` states that one Form owns its own native form boundary, and that the validation of another Form rendered inside it is not part of the outer operation.
  - Line 71 of the same file warns that nested native form elements confuse submit handling. A portal produces no nested form element, so the DOM stays valid HTML.
- Root cause:
  - `packages/canard/schema-form/src/components/Form/components/FormCore/components/FormRoot.tsx:236-247` defines `handleNativeSubmit`, which calls `event.preventDefault()`. It neither stops propagation nor checks that `event.target` is its own form element.
  - `packages/canard/schema-form/src/components/Form/components/FormCore/components/FormRootProxy.tsx:20` binds that handler to `<form onSubmit>`.
  - [React propagates synthetic events through portals to ancestors in the React tree](https://react.dev/reference/react-dom/createPortal), so every ancestor Form's handler runs `handleSubmit(true)` for the dialog's submit event.
- Relation to earlier rounds: New class (React synthetic event propagation through a portal crossing a Form boundary).
- Reopens an earlier fix: No.
- Reproduction: `portalForm.test.tsx`.
  - Test "submitting a portalled dialog Form does not submit the Form that opened it": the outer `onSubmit` is called once; expected zero calls.
  - Test "submitting the dialog Form of a custom input does not call the outer onSubmit (valid outer form)": the outer `onSubmit` calls are `[[{ title: 'Ok title' }]]`, without the `tag` value that the dialog writes; expected no calls.
- Confidence: high, verified through the public API.

## 3. In a schema whose only controls are `active` conditions, a reused `$defs` template's `active` condition never reacts at its second and later locations when it reads a path outside the template or the form context.

- Severity: high. A form that uses one template in two places keeps a value that should be removed in `getValue()` and in the submitted data, or never shows a field that should appear. For example, with `$defs/Contact` used by `buyer` and `seller`, turning `seller.isCompany` off leaves `seller.contact.vatId: 'S-1'` in the output.
- Affected public API: `controls.active` on a node and in `controls.fields[].controls` inside a `$ref` target that is referenced at two or more places or recursively, when the expression reads a `../` path that leaves the template or `@`. The failure is observed through `FormHandle.getValue()`, `FormHandle.findNode()` and submission.
- Contract violated:
  - `documents/docs/canard/schema-form/schema-reference.mdx:76` defines `active` as the existence gate. The same schema written inline behaves correctly, so the reference changes the meaning of the schema.
  - `packages/canard/schema-form/src/core/engine/blueprint/compileBlueprintExpressions/DETAIL.md:17` (CONTROLS-043) and `packages/canard/schema-form/src/core/engine/blueprint/DETAIL.md:111` (gate-evaluation-location) state that each occurrence of a reused template binds its relative paths to its own host instead of inheriting the first location.
  - `packages/canard/schema-form/docs/agents/skills/schema-form-skill/knowledge/expressions.md:79` states that controls expressions recompute when the context changes.
  - The inline-equivalence contract stands. The round 2 fix only failed to cover this case. Its premise is written in `packages/canard/schema-form/src/core/engine/settle/DETAIL.md:19`: blueprints with only `active` gates skip the per-occurrence index because the gate occurrence registry already rebinds them. The probes show that this premise is wrong: the registry corrects where the gate is evaluated, but nothing schedules the second occurrence for evaluation after a write.
- Root cause: `packages/canard/schema-form/src/core/engine/blueprint/blueprint.ts:120` to line 127 sets `hasAliasedDependencies` only when the blueprint also has derived, state or watch capabilities. For a blueprint with only `active` gates, `packages/canard/schema-form/src/core/engine/settle/utils/dependencies/getAliasedDependencyIndex.ts:265` returns undefined, so a write is matched only against the static dependency index, which resolves relative and context reads at the template's first location. Adding any unrelated `visible` or `derived` control makes the turn-off cases pass (controls D1 to D4), which isolates the cause to this capability condition.
- Relation to earlier rounds: Sibling of `../round-2/canard-schema-form.md` item 2. The round 2 regression test `packages/canard/schema-form/src/__tests__/e2e/refControls.round-two.test.tsx` covers `derived`, `visible`, `readOnly` and `disabled`, but not `active`.
- Reopens an earlier fix: `../round-2/canard-schema-form.md` item 2. `git log -L` on the root-cause lines shows commits `1c8e5583e`, `55a95d23b` and `7e74b4b46`. Commit `55a95d23b` ("retain gate-only registration paths") excluded blueprints with only `active` gates and wrote the premise in `settle/DETAIL.md:19`. The fix is incomplete, and fixing this item alone leaves item 4 failing.
- Reproduction:
  - `refActiveOuterPath.test.tsx`, "turning off the second referrer condition removes its value from getValue, as the inline schema does": the actual result still contains `seller.contact.vatId: 'S-1'` after `seller.isCompany` is set to false. The expected result matches the inline schema, which removes it. The control "control: the same $ref schema reacts once an unrelated visible control exists" passes. Both React 19 and React 18 fail the same way.
  - `refFieldsOuterPath.test.ts` O1, O2, O4, O10, O11 and O13 and `refFieldsControls.test.ts` F4 show the same failure. They cover a second referrer at another depth and at the same depth, a node's own `active`, a non-equality expression, two arrays that share one item template, and a recursive tree.
- Confidence: high, through the public API and the internal fixture.

## 4. Even when the per-occurrence index exists, a field that is turned off at the second or later location of a reused `$defs` template never turns back on when its `active` condition reads a path outside the template or the form context.

- Severity: high. The required field never appears, so the user cannot fill it and it is silently missing from the output. For example, with `$defs/Address` used by `billing` and `shipping` and `internalCode` gated by `@.role === "admin"`, changing the context to admin adds the field to `billing` only. This happens even when the schema contains `derived` or `visible` controls, so it reaches more forms than item 3.
- Affected public API: the same controls as item 3, and the Form `context` prop.
- Contract violated:
  - The documents cited for item 3.
  - `packages/canard/schema-form/src/core/engine/settle/DETAIL.md:21` states that the supplementary index binds relative dependencies to the actual host and connects absolute and context dependencies to every occurrence.
  - The inline-equivalence contract stands, and no document decides that turned-off children are left out of the index. The round 2 fix is incomplete here: turning a present field off works (controls D1 and D7), and only turning an absent field on fails.
- Root cause: `packages/canard/schema-form/src/core/engine/settle/utils/dependencies/getAliasedDependencyIndex.ts:168` to line 185 registers only the declarations and gates of a live occurrence node itself. A child whose `active` gate is false has no live node, and its gate lives on the parent's `childEntries` edge (`packages/canard/schema-form/src/core/engine/settle/utils/gates/getGateRegistry.ts:192` to line 216), which the supplementary index never visits. The static context owner list also holds only the template's first `declaration.path` (`packages/canard/schema-form/src/core/engine/settle/utils/dependencies/getContextOwners.ts:74`), so neither a write nor a context change schedules child selection at the second occurrence's parent.
- Relation to earlier rounds: Sibling of `../round-2/canard-schema-form.md` item 2.
- Reopens an earlier fix: `../round-2/canard-schema-form.md` item 2. `git log -L` on the registration loop shows commits `1c8e5583e` and `474a09c60`. Fixing item 3 alone leaves this item failing, as tests D5, D6 and C4 show with the index already built.
- Reproduction:
  - `refActiveOuterPath.test.tsx`, "turning on the second referrer condition adds its field even with an unrelated visible control": the actual `seller.contact` has no `vatId`; the expected value is `'V'`, as in the inline schema.
  - `refActiveOuterPath.test.tsx`, "the context change still misses the second referrer when an unrelated visible control builds the occurrence index": the actual `shipping` has no `internalCode`; the expected value is `'IC'`.
  - `refFieldsOuterPath.test.ts` D5 and D6 (outer path) and C4 (context) fail with the index present. Both React 19 and React 18 fail the same way.
- Confidence: high, through the public API and the internal fixture.

## 5. Inside a batch, a nested object Merge write combined with any other write deletes the nested keys the Merge omitted.

- Severity: high. A consumer who groups a partial object update (`SetValueOption.Merge`) with any other write in `node.batch` or in a `visitSubtree` visitor silently loses nested sibling values, such as `o.a.y`, that the same calls keep without the batch.
- Affected public API: `FieldNode.batch`, `FieldNode.visitSubtree` (a write inside the visitor opens a batch), `FieldNode.setValue` with `SetValueOption.Merge`, and an updater function passed to `setValue` inside a batch.
- Contract violated: `packages/canard/schema-form/src/core/engine/types/value.ts:27` documents Merge as "Retain omitted object keys while replacing supplied values", and a Merge outside a batch merges nested objects deeply. `packages/canard/schema-form/docs/agents/skills/schema-form-skill/knowledge/imperative-and-layout.md:22` recommends Merge for a partial object update, and `packages/canard/schema-form/docs/agents/skills/schema-form-skill/knowledge/arrays-and-scale.md:70` and `:83` present `batch` as a way to group writes that settle once at the end.
- Root cause: `packages/canard/schema-form/src/core/engine/write/utils/chain/utils/replaceAtPath.ts:19` composes a marked Merge with a shallow spread `{ ...previous, ...incoming }`, so the nested object `a` is replaced by `{ x: 9 }`. When the batch holds more than one write, `packages/canard/schema-form/src/core/engine/write/utils/chain/flushBatchWrites.ts:32` to `:35` writes the composed root value as a replacement rather than a Merge, and the partial origin records only the top-level keys (`:90`, `Object.keys(write.value)`), so `/o/a` is replaced whole. A batch with a single write keeps the Merge kind and passes.
- Relation to earlier rounds: New class (the batch composition and the settled write disagree on what Merge means).
- Reopens an earlier fix: No.
- Reproduction: `batchMerge.test.ts`, tests "M1 nested Merge write plus an unrelated sibling write", "M2 two Merge writes on the same object", "M3 updater after a nested Merge sees what the Merge will settle to" and "M4 the same two writes from a visitSubtree visitor". Starting from `{ o: { a: { x: 1, y: 2 }, b: 1 }, s: 's' }`, the batch result has `o.a` equal to `{ x: 9 }`; the expected result, which the same calls give without a batch, has `o.a` equal to `{ x: 9, y: 2 }`.
- Confidence: high; public API on trees built through `buildFieldNodeTree` and `mountFieldNode`.

## 6. Radio fields in one Form whose last path segment is the same name merge into one native radio group, so a loaded selection disappears from the screen and choosing one field clears the other field's displayed choice.

- Severity: medium. The screen is visibly wrong in common schemas, such as a radio field inside array items or `billing/method` beside `shipping/method`. The node values stay correct, so users see an empty choice for a stored value, or a cleared choice they made a moment ago. Real browsers also move arrow-key navigation across a native radio group, so the merged group could write a neighbouring field's value; that risk has no probe (see PROBES). If a browser check confirms it, the severity becomes high.
- Affected public API: the built-in radio input, selected for a string enum by `presentation.inputType` set to `'radio'` or `'radiogroup'` (`packages/canard/schema-form/src/fieldInputs/fieldInputDefinitions/FieldInputStringRadio/index.ts:8-11`).
- Contract violated:
  - `packages/canard/schema-form/docs/agents/skills/schema-form-skill/knowledge/field-input.md:61` and `:66` state that an input receives the form value as its `defaultValue` and displays it.
  - The [HTML Living Standard defines a radio button group](https://html.spec.whatwg.org/multipage/input.html#radio-button-group) as the radio inputs with the same form owner and the same `name`, of which at most one is checked.
  - Predictability: the same field displays differently depending on the names of unrelated fields.
- Root cause:
  - `packages/canard/schema-form/src/fieldInputs/fieldInputDefinitions/FieldInputStringRadio/FieldInputStringRadio.tsx:68` sets the native `name` to the `name` prop.
  - That prop is `node.name`, the last path segment, passed by `packages/canard/schema-form/src/components/FieldProxy/components/FieldInputBridge/FieldInputBridge.tsx:261`. It is not unique inside one `<form>`.
  - The browser and jsdom treat every radio with that name as one group. Of several `defaultChecked` radios only one stays checked, and checking one unchecks the rest.
  - The UI plugins pass the same prop to their radio groups, and r3-ui-plugins confirmed the symptom in antd5, antd6 and MUI (antd-mobile sets no name). Making the name that the core passes to inputs unique fixes the plugins too, while fixing only the core's default radio leaves their symptom.
- Relation to earlier rounds: Sibling of `../round-1/canard-schema-form-antd5-plugin.md` item 2 (an uncontrolled widget whose display diverges from the form value), with a new mechanism: a native name collision.
- Reopens an earlier fix: No.
- Reproduction: `radioGroupName.test.tsx`.
  - Test "two radio fields with the same leaf name show both loaded selections": shipping's checked states are `[false, false]`; expected `[false, true]`. Billing's are correct.
  - Test "choosing a shipping radio keeps the billing radio selection on screen": after the user chooses billing and then shipping, billing's checked states are `[false, false]`; expected `[true, false]`. `getValue()` holds both values correctly.
  - Test "radio fields inside two array items show both loaded selections": the second item's checked states are `[false, false]`; expected `[false, true]`. All four radios have the name `kind`.
- Confidence: high for the display divergence, verified through the public API. The arrow-key consequence is a static inference without a probe.

## 7. A `URLSearchParams` object or an instance of a class with private fields in the Form or FormProvider `context` does not recompute controls when a new object with different content replaces it.

- Severity: medium. `visible`, `readOnly`, `derived` and validation freshness stay on the old context without any diagnostic. Applications that pass query parameters or a session object through `context` show stale conditional fields; React Router's `useSearchParams()` returns a `URLSearchParams`.
- Affected public API: the `context` prop of `Form` and of `FormProvider`, and the `@` token in controls expressions.
- Contract violated:
  - `packages/canard/schema-form/docs/agents/skills/schema-form-skill/knowledge/expressions.md:79` states that dependent controls expressions recompute automatically when `context` changes.
  - `packages/canard/schema-form/docs/agents/skills/schema-form-skill/knowledge/field-input.md:152-153` states that context is compared by content and that changed content propagates.
  - `packages/canard/schema-form/docs/agents/skills/schema-form-skill/knowledge/validation-ux.md:148` exempts only a class instance with equal content, which implies that different content propagates.
- Root cause:
  - `packages/canard/schema-form/src/providers/WorkspaceContext/components/WorkspaceContextProvider.tsx:24` and `packages/canard/schema-form/src/providers/ExternalFormContext/components/ExternalFormContextProvider.tsx:207` stabilize context with `useSnapshot`, which compares through `equals` from `@winglet/common-utils`.
  - For a non-plain object outside its fixed built-in list, `equals` compares only own enumerable string keys (`packages/winglet/common-utils/src/utils/object/equals/utils/equalsRecursive.ts:65`). `URLSearchParams`, `URL` and classes with `#private` fields have none, so different content compares equal and the old snapshot is kept.
  - `packages/canard/schema-form/src/providers/RootNodeContext/components/RootNodeContextProvider.tsx:206-210` then sees an unchanged context reference and never calls `setContext`.
- Relation to earlier rounds: Same class as `../round-2/canard-schema-form.md` item 3 (a change detector that compares only shape misses a same-shape change).
- Reopens an earlier fix: No.
- Reproduction: `contextContent.test.tsx`.
  - Test "a new URLSearchParams with different content in Form context recomputes visible": after rerender `visible` is `false`; expected `true`.
  - Test "a new URLSearchParams with different content in FormProvider context recomputes visible": `false`; expected `true`.
  - Test "a new class instance with different private state in context recomputes visible": `false`; expected `true`.
  - The diagnostic test, which calls the engine's `setContext` directly, passes.
- Confidence: high. The behavior was verified through the public API; the internal diagnostic localizes the cause to the React-layer snapshot.

## 8. The documented collection condition `(../items).length > 0` throws `EXPRESSION_THREW` when the last item is removed, and the form then rejects every `submit()` with `SUBMIT_WHILE_DEGRADED`.

- Severity: medium. Following a documented recommendation, a common action, emptying a list, throws from `remove`, `clear` and `setValue([])`. The form stays degraded even after items are added again, so `submit()` keeps rejecting. A form loaded with the same empty list submits normally, so the same final state gives different results depending on how it was reached.
- Affected public API: `controls.active`; `remove`, `clear` and `setValue` on an array node; `FormHandle.submit()`.
- Contract violated:
  - `packages/canard/schema-form/docs/agents/skills/schema-form-skill/knowledge/troubleshooting.md:39` and `packages/canard/schema-form/docs/agents/skills/schema-form-skill/knowledge/expressions.md:43` recommend exactly `(../items).length > 0`.
  - `packages/canard/schema-form/docs/agents/skills/schema-form-skill/knowledge/arrays-and-scale.md:18` states that the default `omitEmpty` turns an empty array into `undefined` on the parent path, and expressions read the emitted values, so `.length` throws a `TypeError`.
  - `documents/docs/canard/schema-form/error-reference.mdx:50` states that a degraded form rejects submission, which turns the failed recommendation into a blocked form.
- Root cause: The recommended expression does not match the value it reads: under the default `omitEmpty`, an empty list reads as `undefined`. `packages/canard/schema-form/src/core/engine/settle/utils/gates/evaluateGate.ts:202` to line 209 ignores the resulting exception only during the mount guard pass, and turns it into a `SchemaFormError` during a write, which marks the form degraded. The control spelling `(../items)?.length > 0` passes.
- Relation to earlier rounds: Same class as the round 1 cross-package class of documented examples that do not work (`../round-1/README.md`); this is a new instance in this package.
- Reopens an earlier fix: No. `git log -L` on the documentation line and on the cited `evaluateGate.ts` lines shows no bug bounty fix commit.
- Reproduction:
  - `collectionGateExample.test.tsx`, "removing the last item neither throws nor blocks submission": the actual result is `thrown: SCHEMA_FORM_ERROR.EXPRESSION_THREW` and `rejected: SCHEMA_FORM_ERROR.SUBMIT_WHILE_DEGRADED`; the expected result is that neither happens. The controls "a form loaded with an empty list submits" and "control: the optional-chaining spelling removes the last item cleanly" pass. Both React 19 and React 18 fail the same way.
  - `documentedClaims.test.ts` "remove(0) of the last item", "setValue([]) on the array" and "clear()" each report `EXPRESSION_THREW` and status `degraded`.
- Confidence: high, through the public API and the internal fixture.

## 9. Inside a batch, `insert`, `remove` and `pop` treat items by position, so errors and interaction state stay on the wrong row and writes through item nodes land on another row.

- Severity: medium. After `list.batch(() => list.remove(0))`, the row that now holds "b" shows the server error and the touched flag that belonged to "a"; after `insert(0)`, the new row shows them. A write through an item node taken before the batch overwrites a different row or brings back a row that the batch removed. Without the batch, every case is correct. This is a contract conflict for the owner: the consumer document promises that moved items keep their nodes, while the internal contract EVENT-035 and its test pin positional continuity inside a batch.
- Affected public API: `ArrayNode.batch` with `insert`, `remove` and `pop`; `setValue`, `setExternalErrors`, `setState` and `errors` on item nodes.
- Contract violated: `packages/canard/schema-form/docs/agents/skills/schema-form-skill/knowledge/arrays-and-scale.md:12` states that after `insert` the items from the index on keep their nodes and keys and move back one position, and `:70` offers `batch` as a way to group array writes. `packages/canard/schema-form/src/core/engine/settle/arrangeFieldNodeItems/DETAIL.md:121` makes issues follow moved nodes so that `getErrors()` does not point at another item. On the other side, `packages/canard/schema-form/src/core/engine/write/DETAIL.md:73` (EVENT-035) says that item continuity follows position inside a batch, and `packages/canard/schema-form/src/core/engine/write/__tests__/dispatch.array-entry.test.ts:324` asserts that the node at position 0 is the same object after a batched insert.
- Root cause: `packages/canard/schema-form/src/core/engine/write/utils/chain/markBatchArrayOperation.ts:45` records each array method as a mark that replaces the whole array, so the batch settles as a positional write in which no node moves. Later marks are composed at the path the node had when the call was made (`packages/canard/schema-form/src/core/engine/write/utils/chain/composeBatchValue.ts:24`), and `packages/canard/schema-form/src/core/engine/write/utils/chain/isBatchMarking.ts:11` accepts a write to an item that a marked method has already removed.
- Relation to earlier rounds: Sibling of `../round-1/canard-schema-form.md` item 6 (an issue `dataPath` left stale after an array insert or removal); the round 1 fix covered the methods called outside a batch.
- Reopens an earlier fix: No.
- Reproduction: `batchItemIdentity.test.ts`, test "I1 remove(0): the error and touched flag of "a" do not move to "b"": the row "b" has errors `['server']` and touched `true`; expected no errors and touched `false`. Test "I2 insert(0): the error and touched flag of "a" stay on "a"": the new row "n" carries them; expected they stay on "a". `batchItemWrites.test.ts` starts from `['a', 'b', 'c']`: test "P1 remove(0) then write the item that held "b"" gives `['b', 'Z']`, expected `['Z', 'c']`; test "P2 remove(1) then write the removed item" gives `['a', 'Z']`, expected `['a', 'c']`; test "P3 pop() then write the popped item" gives `['a', 'b', 'Z']`, expected `['a', 'b']`; test "P4 insert(0) then write the item that held "a"" gives `['Z', 'a', 'b', 'c']`, expected `['n', 'Z', 'b', 'c']`.
- Confidence: high for the behavior; medium that the owner treats it as a defect, because EVENT-035 and its test pin positional continuity deliberately. Public API on trees built through `buildFieldNodeTree` and `mountFieldNode`.

## 10. Inside a batch, `resetSubtree` is undone when the batch ends if an ancestor write was marked earlier in the same batch.

- Severity: medium. A consumer who pushes to an array or writes the root and then resets one subtree in the same batch sees the reset applied inside the batch and silently reverted when the batch ends.
- Affected public API: `FieldNode.resetSubtree` inside `FieldNode.batch`, after an ancestor `setValue` or an array method on an ancestor.
- Contract violated: `packages/canard/schema-form/docs/agents/skills/schema-form-skill/knowledge/arrays-and-scale.md:83` states that `node.resetSubtree()` settles its load immediately even inside a batch, and `packages/canard/schema-form/src/core/engine/write/DETAIL.md:53` (EVENT-013) states that a subtree reset clears the marks in its own scope and loads immediately.
- Root cause: `packages/canard/schema-form/src/core/engine/write/utils/entry/dispatchResetSubtree.ts:30` to `:33` removes only the marks on the reset node and on its descendants. A mark on an ancestor, including the whole-array mark that `push` records, still carries the subtree's value from before the reset, and `flushBatchWrites` applies it after the reset. The existing test "EVENT-015 and EVENT-072 settle subtree reset immediately inside batch" in `packages/canard/schema-form/src/core/engine/settle/__tests__/dispatch.batch.test.ts` covers only a mark on the same node and reads only inside the batch.
- Relation to earlier rounds: New class; it shares the batch mark composition with item 9 but goes through a different function and mechanism (the scope filter of a subtree reset).
- Reopens an earlier fix: No.
- Reproduction: `batchSubtreeReset.test.ts`. Test "R1 push on the array, then reset an edited item" gives `['EDITED', 'b', 'c', 'x']`, expected `['a', 'b', 'c', 'x']`. Test "R2 root setValue, then reset one section" gives `o.a` equal to `'server'`, expected `'loaded'`. Test "R3 the reset is visible inside the batch and undone when the batch ends" reads `{ a: 'loaded' }` inside the batch and `{ a: 'server' }` after it; expected `{ a: 'loaded' }` both times.
- Confidence: high; public API on trees built through `buildFieldNodeTree` and `mountFieldNode`.

## 11. The documented bulk-update example `setValue((prev) => ({ ...prev, items }))` deletes the values that an inactive branch retains.

- Severity: medium. A consumer who follows the documented example to replace one array erases what the user typed in an inactive `oneOf` branch, so switching back to that branch no longer restores it; writing the array node directly keeps it. The owner decides whether the code or the document changes.
- Affected public API: `FormHandle.setValue` and `FieldNode.setValue` with an updater function; the retention exposed by `FieldNode.inactiveValues`.
- Contract violated: `packages/canard/schema-form/docs/agents/skills/schema-form-skill/knowledge/arrays-and-scale.md:76` to `:80` recommends this updater for bulk writes. `packages/canard/schema-form/docs/agents/skills/schema-form-skill/knowledge/nullable-branch-nodes.md:24` lists the restore of a `oneOf` or `anyOf` branch, and `packages/canard/schema-form/src/core/surface/runtime/FieldNode.ts:368` exposes the retained values. Because the updater's `prev` does not contain them, the consumer cannot keep them, so the rule in `packages/canard/schema-form/docs/agents/skills/schema-form-skill/knowledge/imperative-and-layout.md:22` that Overwrite drops unspecified sibling values cannot be avoided.
- Root cause: `packages/canard/schema-form/src/core/engine/write/utils/entry/dispatchSetValue.ts:43` passes `node.storedValue`, which excludes the sources retained for inactive fields, to the updater. The returned value is then written as a whole replacement, and a whole replacement deletes the retained sources in its omitted scope (`packages/canard/schema-form/src/core/engine/settle/DETAIL.md:139`, VALUE-031).
- Relation to earlier rounds: Same class as round 1 class 19, documented examples that do not work (`../round-1/README.md`).
- Reopens an earlier fix: No.
- Reproduction: `updaterRetention.test.ts`, test "U1 setValue(prev => ({ ...prev, items })) keeps what the inactive branch retained". After typing `'typed in A'` into `fieldA`, switching to B, writing through the updater and switching back to A, the value is `{ type: 'A', items: ['x', 'y'] }`; expected, as with `items.setValue(['x', 'y'])`, a value that also holds `fieldA: 'typed in A'`.
- Confidence: high for the behavior; medium for the contract, because the deletion follows the documented Overwrite semantics. Public API on trees built through `buildFieldNodeTree` and `mountFieldNode`.

## 12. A validator that writes an unchanged value back into the form during its run makes OnChange validation repeat without end, and its verdict never reaches the fields.

- Severity: medium. An application whose asynchronous keyword or custom validator records its result on the form never sees the OnChange errors, and the form keeps calling the validator, about 1,000 to 10,000 times in 400 ms, which floods a server when the keyword calls one.
- Affected public API: OnChange validation mode, the function returned by `Validator.compile`, AJV asynchronous keywords used through `createValidator(ajv)` or `plugin.validator`, `node.setValue`, `node.errors`.
- Contract violated:
  - `packages/canard/schema-form/src/core/engine/settle/DETAIL.md:89` states that a change whose value comes back equal is not announced as new input.
  - `packages/canard/schema-form/src/core/engine/validation/DETAIL.md:11` and `packages/canard/schema-form/src/core/engine/validation/DETAIL.md:183` state that the point of discarding a late result is to keep it from overwriting new input.
  - `packages/canard/schema-form/docs/agents/skills/schema-form-skill/knowledge/validation-ux.md:9` states that continuous edits end with a trailing run that produces the verdict.
  - Predictability: a write that changes nothing must not change any other outcome.
- Root cause:
  - `packages/canard/schema-form/src/core/engine/validation/utils/run/requestFieldNodeValidation.ts:59` records `commitNumber` when a run starts.
  - Lines 69 to 74 of the same file discard the verdict and request a new run whenever the commit number has changed.
  - `packages/canard/schema-form/src/core/engine/settle/utils/commit/commitSettlement.ts:60` increments the commit number for every settlement, including one whose write changes nothing. A same-value write therefore discards the verdict, and when the validator itself makes that write, every run discards its own verdict.
- Relation to earlier rounds: The mirror image of `../round-2/canard-schema-form.md` item 3, where a change detector that compared only shape missed a real write; here freshness is judged by a write counter instead of the value, so a write that changes nothing counts as a change. New class in validation scheduling.
- Reopens an earlier fix: No. `git log -L 59,74` on the root-cause file lists `b63bac7f0`, `3a72d109d`, `5528e4026` and `c5c7c453b`, none of them a bug bounty fix.
- Reproduction: `reentrantValidator.test.ts` in the probe folder.
  - "a validator writing the same value back settles after a bounded number of runs (OnChange)": the actual run count is 10,040 after load and 24,317 after one edit (9,537 and 24,103 in a second run of the file); the expected count is at most 3 each.
  - "the verdict of a validator that writes the same value back still reaches the field (OnChange)": the actual `/name` errors are `[]`; the expected errors are `['x']`.
  - "an AJV8 async keyword that records its check on the form settles (OnChange)": the actual result is 1,024 keyword calls in 400 ms with `/name` errors `[]`; the expected result is at most 3 calls with `['availableName']`.
- Confidence: high for the behavior and the mechanism, which the diagnostic test confirms. Verification level: internal fixture with the public `FieldNode` API, and the AJV 8 plugin source.

## 13. When two independently bundled applications on one page each register a plugin, the later registration replaces the validator and renderers of the other application's forms.

- Severity: medium. In a micro-frontend page where each application bundles its own copy of `@canard/schema-form`, application A's forms are validated by application B's validator and drawn with application B's renderers without any diagnostic, and `registerPlugin(null)` in one application resets the other. The published 0.16.1 kept one registry per copy, so these applications were isolated.
- Affected public API: `registerPlugin`, `Form`.
- Contract violated: `.changeset/schema-form-shared-plugin-registry.md:5`, a patch entry, announces sharing only between compatible ESM and CommonJS copies, and `packages/canard/schema-form/src/app/plugin/DETAIL.md:5` says the registry owns the application's global default configuration. The behavior is also not predictable, because application A's validation and rendering depend on whether another application's bundle is present on the page. By contrast, `@lerx/promise-modal` announced the same cross-bundle sharing as a major breaking change (`.changeset/promise-modal-shared-runtime.md`).
- Root cause: `packages/canard/schema-form/src/app/plugin/utils/getPluginRegistry.ts:47` keys the registry with `Symbol.for('@canard/schema-form/plugin-registry/0.16')`, a realm-global slot, and `:68` stores one shared object in it. Every evaluated copy with that key, including a copy built into another application's bundle, binds `PluginManager.ts:13` and `registerPlugin.ts:13` to that same object. Nothing scopes a registration to the application that made it; the only per-application route is passing every member through `FormProvider`.
- Relation to earlier rounds: introduced by the round 2 schema-form 7 fix (`eb5792acf` and `22f762da7`), see `../round-2/canard-schema-form.md` item 7. Same class as round 2 class 5, more than one copy of a package in one application.
- Reopens an earlier fix: No. The round 2 behavior still holds: a plugin registered through the Node ESM entry still reaches a `Form` loaded through the CommonJS entry. This item is the cost of the recorded round 2 decision (`../round-2/FIXES.md`, decisions for `@canard/schema-form` item 7 and the known limit that the registry is shared within one realm and one registry version). A fix that narrows the sharing scope would reverse that decision, so the owner decides the trade-off.
- Reproduction: `twoBundlesRegistry.test.tsx`. "app A's form keeps app A's plugin after app B (another bundle on the page) registers its own": the actual result is `{ appA: false, appB: true }`, the expected result is `{ appA: true, appB: false }`. "app A's form keeps app A's validator after app B (another bundle on the page) registers its own": the actual compile calls are `['B']`, the expected result is `['A']`.
- Confidence: high for the mechanism and medium for how often the layout occurs; verified through the public API rendered from source in the `render` project.

## 14. The `FormLabel` JSDoc example `<Form.Input path="/password" type="password" />` renders an unmasked text input.

- Severity: low. A documented example does not work. Its consequence matters: an application that follows it shows the password in plain text, and browser autocomplete may treat it as ordinary text.
- Affected public API: extra props on `Form.Input`, typed by `OverridableFieldInputProps`.
- Contract violated:
  - `packages/canard/schema-form/src/components/Form/components/FormLabel/FormLabel.tsx:45` is the example.
  - `packages/canard/schema-form/src/components/Form/components/FormInput/FormInput.tsx:53` states that other extra props reach the field input component unchanged.
  - The index signature at `packages/canard/schema-form/src/types/field/fieldInput.ts:187` accepts `type`, so type checking does not catch the example.
- Root cause:
  - `packages/canard/schema-form/src/components/FieldProxy/components/FieldInputBridge/FieldInputBridge.tsx:247` spreads the override props, and line 258 then sets `type={node.type}`, which replaces the caller's `type`.
  - The built-in string input chooses its HTML input type only from `jsonSchema.format` (`packages/canard/schema-form/src/fieldInputs/fieldInputDefinitions/FieldInputString/FieldInputString.tsx:24-28`).
- Relation to earlier rounds: Same class as `../round-1/winglet-data-loader.md` item 1 (a documented example or configuration that does not work).
- Reopens an earlier fix: No.
- Reproduction: `jsdocExamples.test.tsx`, test "the documented <Form.Input path=\"/password\" type=\"password\" /> renders a masked input". Actual `'text'`; expected `'password'`.
- Confidence: high for the behavior, verified through the public API. Whether to change the example or the behavior is the owner's choice.

## 15. A `$ref` such as `#/$defs/X` inside an embedded `$id` resource is resolved against the document root, so the form builds a different field from the one the validator checks, or fails to load.

- Severity: low. It needs a compound document, which is uncommon in form schemas. When the root also defines `$defs/X`, the form builds a `number` field with default `1` while AJV requires a `string`, so the user can never enter a valid value. When the root lacks `X`, the form fails to load with `UNKNOWN_JSON_SCHEMA`. Whether this is a defect is an owner decision, because `packages/canard/schema-form/src/core/engine/blueprint/buildNodes/DETAIL.md:89` (BLUEPRINT-030) states that `$ref` resolves only standard JSON Pointers within the authored root, which may describe an intended limit.
- Affected public API: `$ref` and `$id` in the `jsonSchema` passed to `Form`.
- Contract violated: In JSON Schema, `$id` changes the base URI against which `$ref` is resolved inside that subschema ([JSON Schema 2020-12 Core, section 8.2.1](https://json-schema.org/draft/2020-12/json-schema-core#section-8.2.1)). `documents/docs/canard/schema-form/validation.mdx:54` states that the engine passes the root to the validator with its `$ref`, `$id` and anchor context preserved, so the validator and the form read different schemas.
- Root cause: `packages/canard/schema-form/src/core/engine/blueprint/buildNodes/utils/references/resolveReference.ts:22` to line 72 walks every `#…` reference from `context.schema`, the authored root, and ignores the base URI that an embedded `$id` sets.
- Relation to earlier rounds: Same class as `../round-2/canard-schema-form.md` items 1, 2 and 9, where indirection changes the location a decision is keyed on.
- Reopens an earlier fix: No. `git log -L` on the root-cause lines shows commits `5528e4026`, `485e11dd6` and `c5c7c453b`, none of which is a bug bounty fix.
- Reproduction: `embeddedIdBase.test.ts`, "the form builds the field the validator checks (root also has X)": the actual field type is `number` with value `1`; the expected type is `string` with value `'inner'`. In "the form loads a compound document whose root has no X", the actual result is `UNKNOWN_JSON_SCHEMA`; the expected result is a loaded `string` field. The AJV reference test in the same file passes and confirms the validator's reading.
- Confidence: high for the behavior and medium for whether the owner considers it a defect; internal fixture only.

## 16. Calling the cleanup returned by `subscribe` a second time removes a later subscriber of the same node.

- Severity: low. It needs consumer code that calls its own cleanup twice, such as a one-shot listener that unsubscribes itself and is cleaned up again on teardown; the effect then reaches a different subscriber, including a field that mounts later, which stops receiving events.
- Affected public API: `FieldNode.subscribe`.
- Contract violated: `packages/canard/schema-form/src/core/engine/write/DETAIL.md:167` (write-inactive-registration) requires for the sibling registration `onInactive` that an old cleanup function never removes a newer registration set, and `onInactive` keeps that rule (control S2 passes). `subscribe` returns a cleanup of the same kind without that protection.
- Root cause: `packages/canard/schema-form/src/core/engine/write/utils/read/subscribeFieldNode.ts:30` deletes the node's entry from the listener map whenever the captured subscription set is empty, without checking that the map still holds that set. After the first cleanup empties the set and a later subscriber creates a new set, the second call deletes the new set. `packages/canard/schema-form/src/core/engine/write/utils/read/onInactiveFieldNode.ts:31` performs that check.
- Relation to earlier rounds: New class (a stale cleanup removes a newer registration).
- Reopens an earlier fix: No.
- Reproduction: `subscriptionCleanup.test.ts`, test "S1 a one-shot listener whose cleanup also runs on teardown drops a later subscriber": after the second cleanup call, the later subscriber receives no `UpdateValue` event for the next write; expected that it receives one.
- Confidence: high; public API on trees built through `buildFieldNodeTree` and `mountFieldNode`.

## 17. Routing validation issues takes time that grows with the square of the number of issues that land on one node.

- Severity: low. A form with a large terminal array, such as a 20,000-row import field, blocks the main thread for about half a second to several seconds on each validation; 40,000 issues on one node take about 2 seconds.
- Affected public API: `node.validate()`, `FormHandle.validate()`, OnChange validation, `node.errors`. The cost applies to any node that receives many issues: terminal objects and arrays, and branch nodes that receive issues with `rejectedKey`.
- Contract violated: The round brief's definition of a pathological cost, super-linear growth on realistic input. Terminal arrays are the strategy that `packages/canard/schema-form/docs/agents/skills/schema-form-skill/knowledge/arrays-and-scale.md:38` offers for large data, and the validation-route clause at `packages/canard/schema-form/src/core/engine/validation/DETAIL.md:179` asks routing to reuse work instead of repeating it.
- Root cause: `packages/canard/schema-form/src/core/engine/validation/utils/route/routeValidationIssues.ts:106` appends each issue with `next.set(node, [...previous, issue])`, which copies the node's whole list for every issue. N issues on one node therefore cost on the order of N squared element copies, while the same number of unroutable issues stays linear.
- Relation to earlier rounds: New class.
- Reopens an earlier fix: No. `git log -L 100,110` on the root-cause file lists `251e6f26b`, `b63bac7f0` and `c5c7c453b`, none of them a bug bounty fix.
- Reproduction: `manyIssues.test.ts`, "core routing time grows linearly with the issue count on one node (4x issues, < 8x time)". The actual time is 72.0 ms for 10,000 issues and 2,070.2 ms for 40,000 issues, a ratio of 28.8; the expected ratio is below 8. The control "[control] unroutable issues of the same count scale linearly" passes.
- Confidence: high that the growth is super-linear and that the append is the cause. Verification level: internal fixture with the public `FieldNode` API, measured by wall-clock time.

## Symptoms of root causes in other packages

### A map entry issue whose key contains a quote is shown on a valid field

Owning item: [@canard/schema-form-ajv6-plugin item 2](canard-schema-form-ajv6-plugin.md).

- In a form validated by the AJV 6 plugin, an issue inside an `additionalProperties` map entry whose key contains a single quote is shown on an unrelated, valid field of the same form.
- Schema: a root object with `properties: { x: { type: 'string' } }` and `additionalProperties: { type: 'object', properties: { x: { type: 'string', minLength: 3 } } }`; value `{ x: 'valid', "it's": { x: 'a' } }`.
- Reproduction: `dynamicKeyRouting.test.ts`, "ajv6 map entry issue routing > an issue inside map entry "it's" is not shown on the valid root field x". The actual result is the issue list `[['minLength', '/x']]` and `minLength` on the root field `x`; the expected result is `[['minLength', "/it's/x"]]` and no error on `x`. The `ajv7` and `ajv8` rows pass.
- Verification level: internal fixture with the public `FieldNode` API and the AJV 6 plugin source.

## Hypotheses checked and not bugs

- From `r3-react`:
  - A Form inside an open shadow root behaves as in the light DOM. Clicking a label toggles its boolean input, `FormHandle.focus(path)` focuses the input, and native submission focuses the first invalid input (`shadowRoot.test.tsx`). Focus tracking under virtualization was checked only by reading the code: `focusin` and `focusout` reach the document retargeted to the shadow host, so the "focus has moved" check stays correct.
  - Unmounting a virtualized Form with a pending focus request leaves no document or window listener behind and no observed element (`unmountCleanup.test.tsx`). Only React DOM's own `selectionchange`, `mouseover` and `mouseout` listeners remain. The root subscription and scheduled validation slots outliving unmount are documented in `packages/canard/schema-form/src/providers/RootNodeContext/DETAIL.md:33`.
  - Late asynchronous callbacks from an input write neither value nor file and call no `onChange` (`lateInputCallbacks.test.tsx`). This holds when the input instance was retired by `reset()`, when an inactive gate unmounted it, and when the whole Form unmounted.
  - The site examples run as written (`siteExamples.test.tsx`): `ComposedForm`, `CustomInputForm` and `SubmitForm` from `documents/docs/canard/schema-form/examples/index.mdx`, and `MediaUpload` from `examples/media-registration.mdx`.
  - Two Forms that receive the same schema, `defaultValue`, `context` and `errors` objects neither freeze nor mutate them (`propOwnership.test.tsx`).
  - A nested FormProvider hides the outer provider's settings. This matches the documented hiding of the outer InputRenderer (`documents/docs/canard/schema-form/api-reference.mdx:109`), so it is consistent design.
  - A `null` value in a string enum without a `null` option displays the first option. `packages/canard/schema-form/src/fieldInputs/fieldInputDefinitions/FieldInputStringEnum/DETAIL.md` (REACT-027, third bullet) records this as a known limit.
  - Form children equal to `false` render the automatic layout (`packages/canard/schema-form/src/components/Form/components/FormCore/components/FormRootProxy.tsx:21`). React treats `false` as no children, so this is reasonable.
  - The week count in `isRenderableDateInputValue` follows the ISO 53-week rule. It was checked by reading the code against the years 2015 and 2020.
- From `r3-compile`:
  - `oneOf`, `anyOf`, gated `allOf` and `if`, `then` and `else` written through `$ref` behave like their inline forms in 17 cases, including double indirection, nested `oneOf`, array items, discriminators and a template referenced twice with paths inside the template (`refBranches.test.ts`).
  - `oneOf` branch gates that read a path outside a reused template follow writes at every location (`refFieldsOuterPath.test.ts` O12).
  - The equality fast path for expressions such as `../x === "A"` gives the same results as the general compiled function for 17 literals, 6 node types and 4 control keys, including `-0`, `1e21`, hexadecimal literals, string escapes and the empty string under `omitEmpty` (`equalityFastPath.test.ts`).
  - Expressions in sibling, absolute and fragment forms reach 37 special property names, including `__proto__`, `constructor`, quotes, `%`, `~`, `/` and the percent spellings of the reserved operators, in `derived`, `active` and `watch` (`specialNames.test.ts`).
  - Raw and percent-encoded spellings of one `$ref` target, `%24defs`, `%7E1`, UTF-8 percent encoding and the `definitions` keyword give the same results, and `$defs` entries with special names resolve (`refSpelling.test.ts`).
  - `controls.fields` targets, `options.virtual` fields, `options.propertyOrder`, `required` and the discriminator name treat special names literally (`childNameContexts.test.ts`).
  - Equivalent type spellings give the same results: `nullable: true` and type arrays in both orders, a one-element type list, a type inside `allOf`, types inferred from `enum` and `const`, draft-07 and 2020-12 tuple spellings, and a nullable type behind `$ref` (`schemaSpellings.test.ts`).
  - A `derived` expression that returns `NaN`, `Infinity`, `-0`, `1e21` or a new array or object on every evaluation neither loops nor throws; storing `NaN` as written is the expression author's responsibility (`derivedNumbers.test.ts`).
  - `[../a, ../b]` failing to compile is the known rule that a path followed directly by an operator character reads as one name, which round 1 listed as not a bug.
  - Expressions that read array index paths such as `../items/0` stay correct over 300 seeded sequences of inserts, removals, pops and replacements (`indexPathReads.test.ts`).
  - Six spellings of one `watch` and `derived` path, `/top`, `#/top`, `../../top`, `../.././../top`, `./../../top` and `../../g/../top`, give the same results (`watchSpellings.test.ts`).
  - Numeric constraints merge correctly through `allOf`: minimum and maximum narrow, decimal `multipleOf` values combine to their least common multiple, `0` and `-0` match in `enum` and `const`, and `1e21` bounds stay exact (`numericConstraints.test.ts`).
  - The documented default precedence (node `controls.default`, parent `fields`, fragment `controls.default`, then standard `default`) and the context examples in `expressions.md` behave as documented (`documentedClaims.test.ts`).
  - One array whose item template reads the array owner works, so item 3 and item 4 need a template reused at two or more places or recursively (`refFieldsOuterPath.test.ts` A1).
  - `visible`, `readOnly`, `derived`, `unsetValue` and `resetInteraction` inside reused templates follow outer paths and context at every location, so the round 2 fix holds for them.
- From `r3-engine`:
  - A listener that throws does not stop the other listeners of the same node or of other nodes; `onChange` still runs, `LISTENER_THREW` is reported, and the next write delivers exactly once; the same holds during a form reset.
  - Unsubscribing during a delivery wave takes effect immediately, and a subscription made during a wave starts with the next wave, as the dispatch-waves contract states.
  - A listener that resets the form during delivery leaves values and `onChange` consistent, and listener write-backs keep the delivered previous and current values chained across waves (300 seeded cases).
  - A `derived` expression that throws at mount is reported and recovers once its source appears; other rules keep computing; a throwing rule on one array item does not stop the other items; a throwing `active` gate keeps the value and recovers.
  - An `onInactive` resolver that throws cancels that node's override and reports the failure; an `onChange` that throws does not affect the next write.
  - A `derived` result of `NaN` gives only a misfit warning and does not exceed the derive budget; `-0` and `0` are delivered as the same value; string-to-number conversion follows the unionBehavior table.
  - `insert`, `remove` and `update` with edge indexes (`-0`, `NaN`, `1e21`, `Infinity`, `Number.MAX_SAFE_INTEGER`) give the same results inside and outside a batch, and `-0` addresses the first item.
  - A same-key write to a branch object advances its external value revision, and a whole-object custom input remounts with the new `defaultValue` after root, node, leaf and `derived` writes; an object with `presentation.FieldInput` is terminal, as documented.
  - A single `setValue` and the same write wrapped in `batch` give identical values, events and revisions (400 seeded cases), so the same-value fast path agrees with the general path.
  - Revision counts are the same whether or not revisions were read or listeners were attached (150 seeded cases), and the global touched aggregate follows `remove`, `clear`, `setValue([])`, `pop` and gate exits.
- From `r3-validation`:
  - Issues for 28 special property names (`%`, `%25`, `%2F`, `~`, `~1`, `/`, `a/b`, `a b`, the empty name, an emoji, a Korean name, `*`, `.`, `..`, `@`, `#`, both quote characters, a backslash, `[0]`, `0`, `a.b`, `a'b` and the others in `specialNames.test.ts`) reach the right field for `minLength` and `required` through all three AJV plugin sources, apart from AJV's own `__proto__` and inherited-name behavior described under PROBES.
  - A terminal object holding 5,000-level deep data validates and revalidates after an edit through all three AJV plugin sources (`deepData.test.ts` passes).
  - `createValidatorCopy` keeps a `__proto__` key as an own property through `Object.defineProperty` and copies deep schemas with an explicit stack, so neither prototype pollution nor recursion depth is a risk there (static check).
  - Rewriting held issue paths after an array move (`rekeyValidationIssuePaths`) is linear in the number of issues for each move (static check).
  - A synchronous validator that reads the form during its run sees the same value it validates.
  - A validator that writes only when the value differs settles after a bounded number of runs.
  - Caching a whole-schema compile failure per schema object and validator is documented in `validation-failures.md`, and storing guard failures follows the validation-guard clause, so neither is a finding.
- From `r3-contracts`:
  - The public declarations of `@canard/schema-form`, `@lerx/promise-modal` and `@winglet/react-utils` type-check against `@types/react` 18.3.23, which the React 18 peer range admits, with `skipLibCheck: false` (`react18Types.test.ts` passes; rejected hypothesis).
  - The UI and AJV plugins import nothing from `@canard/schema-form` at run time (only types and JSDoc mentions of `registerPlugin`), so no plugin depends on the core copy's module identity.
  - The default renderers and built-in field inputs held by the shared registry use no schema-form React context, so a second copy's `Form` renders the first copy's defaults correctly.
  - Every one of the 23 `@winglet/*` subpaths that consumer packages import is listed in the target package's `exports`.
  - The registry key ending in `0.16` collides with no published version, because 0.16.x published releases have no shared registry.

## Open leads

- From `r3-react`:
  - `useChildFieldMap` builds its Proxy target from a plain `{}` (`packages/canard/schema-form/src/hooks/fieldNode/useChildFieldMap.ts:25` and `:32-35`). A missing child whose name is `constructor`, `toString` or another `Object.prototype` member may therefore return the inherited member instead of the no-op component, and a child named `__proto__` replaces the target's prototype. No probe was run; it falls under angle BS3, outside this hunter's angles.
- From `r3-compile`:
  - A property name that contains whitespace or brackets cannot be referenced from any controls expression, because the path grammar stops at whitespace and brackets; whether `watch` accepts such names and whether the documents should state the limit was not checked.
- From `r3-engine`:
  - An asynchronous validation overtaken by `reset`, by a schema change or by a write was checked by reading the code only: `isFieldNodeValidationCurrent` compares the load stamp, the mode epoch, the request stamp and the commit number before publishing.
