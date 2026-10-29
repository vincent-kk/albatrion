# B12 independent review — verdict

Reviewed range: `4d0fa4a12..f69aa1388` on `fix/schema-form-b12-inactive-value` (worktree `branch-switch-b12`). Contract: the stage copy of `architecture/plan/branch-switch/exit-value.md` at `15820937e`, including the three later decisions (rule 6 fallback order, rule 3 multi-listener order and throw cancellation, rule 5 suppression scope). Static review only: no build, test, typecheck or lint was run because a measurement window may be active. Paths below are relative to `packages/canard/schema-form/`.

The worker later committed the P1-1 fix as `014946bbc` on the same branch. The worktree is otherwise clean apart from the untracked results document and raw directory. That commit is reviewed separately in the delta section at the end of this file.

**Verdict for `f69aa1388`: FAIL — P1 1 / P2 2 / P3 9.** Do not merge `f69aa1388`. Window 1 was stopped and classified `candidate-invalid` against it.

**Verdict for `014946bbc` (delta): CONDITIONAL PASS — P1 0 / P2 2 / P3 12.** That commit resolves P1-1. Merge needs five conditions:
- P2-1 lands.
- The P2-2 test is added, and its fix is applied if the test fails.
- The final head passes build, typecheck, lint, the five projects, verify, the declaration diff, the isolation test and the first-write test.
- The corpus and declaration diff are rerun.
- One new window, A as the stage head and B as the final head, passes its gates.

## P1

**P1-1. When an array rekey and a gate exit land in the same settlement, both resolver forms read another item's previous value (confirmed by trace; window 1 was stopped on the same symptom).**
- Where: `src/core/engine/settle/utils/inactive/resolveInactiveValue.ts:38-42` and `src/core/engine/settle/utils/inactive/getInactiveValueContext.ts:20-37`.
- What each input is built from in `f69aa1388`:
  - `value` is `getLoadValue(previousEmit, node.path, …)`, read at the current, post-move path. It is wrong for a moved node.
  - `dataPath` is the current `node.path`. It is wrong for a moved node.
  - `parentValue` is `getLoadValue(previousEmit, parent.path, …)`, also read at the current path. It is wrong when the parent moved.
  - `jsonSchema` and `parentJSONSchema` are `originalSchemas.get(<current path>)?.schema ?? <node>.schema.schema`. These are correct, which corrects this file's first version. The scratch `originalSchemas` map is empty when the array is arranged (`releaseSettlementScratch.ts:37`). `computeNode`, `primeHost` and `selectEntryStep` fill it only after the move, keyed by the new path. So the lookup returns the moved node's own pre-compute schema, or misses and falls back to that same schema.
  - `rootValue` is `previousEmit` itself, independent of path, and is correct.
  - Committed declaration IDs and rule values are correct too. `rekeyArrayRuntimePaths` moves those stores during the arrange step (`applyArraySplice.ts:100`, `applyArraySlots.ts:169`).
- Evidence: `applyArraySplice` and `applyArraySlots` rename moved items with `updateFieldNodeNameAndPath` before `finalizeExits` runs, and they record the old path only in `context.pathChanges`. `previousEmit` is never rekeyed. Take rows `[{ on: true, note: 'n0' }, { on: false, note: 'n1' }]` where `note` has `active: '../../0/on === true'`. After `rows.remove(0)`, the moved note, now `/rows/0/note`, leaves. Its resolver receives `value` `'n0'`, `dataPath` `'/rows/0/note'` and the removed row as `parentValue`. Its result is then written into the moved row's retained slot. This breaks contract rule 1 silently. `raw/b12/window-1-invalid/invalid.json` records the stop reason "Rekeyed exit resolver read n0 instead of the moved n1 previous snapshot". No test in `f69aa1388` combines a rekey with an exit.
- Fix spec: read `value`, `dataPath` and `parentValue` at the first `pathChanges.previous` entry of the node and of its parent. Keep the write address at the current retained position, and add the two rekey tests. Commit `014946bbc` does exactly this; see the delta section below.

## P2

**P2-1. The key type `InactiveValue<unknown>` collapses to `unknown`, so `controls.inactiveValue` carries no resolver interface at the type level (confirmed by the TypeScript rule that `unknown` absorbs every union member; not compiled because typecheck is barred during the window).**
- Where: `src/core/engine/types/controls.ts:67`. It reaches the public `JSONSchema` through `SchemaControls<JSONSchema>` in `src/types/schema/jsonSchema.ts:218`.
- Evidence: `unknown | InactiveValueResolver<unknown>` is just `unknown`. Both SPECIFICATION tables advertise an inline `inactiveValue: (value, context) => …`. That arrow gets no contextual signature, so its parameters are implicitly `any` and fail `noImplicitAny` (enabled in `tsconfig.base.json`) for strict consumers. A function of any arity is also accepted silently. The owner closed the design on "both use the same function interface", but only `onInactive` (`src/core/surface/type.ts:137`) is typed with that interface. The suite cannot notice: `src/__tests__/e2e/inactive-value.type.test.ts:34-39` assigns a pre-annotated variable, and every other test uses parameterless arrows.
- Fix spec: replace line 67 with `inactiveValue?: InactiveValueResolver<unknown> | string | number | boolean | null | object;`. Change its TSDoc to "Literal (string, number, boolean, null, object or array) or the shared `InactiveValueResolver`; an inline function is typed by the resolver signature." Add this test to `src/__tests__/e2e/inactive-value.type.test.ts`:
  ```ts
  it('types an inline declaration resolver with the shared interface', () => {
    const schema: JSONSchema = {
      type: 'string',
      controls: {
        inactiveValue: (value, context) => {
          expectTypeOf(value).toEqualTypeOf<unknown>();
          expectTypeOf(context).toEqualTypeOf<InactiveValueContext>();
          return context.dataPath;
        },
      },
    };
    expectTypeOf(schema).toMatchTypeOf<JSONSchema>();
  });
  ```
  Record the changed key type in the declaration diff.
- Verify: before the change, `yarn workspace @canard/schema-form typecheck` must report TS7006 on the new test. The tsconfig includes `src/**/*.ts`. After the change, typecheck passes. `src/types/__tests__/controlsSurface.type.test.ts` and the public surface snapshot stay green.

**P2-2. A descendant that leaves in an earlier wheel than its clearing ancestor is resolved under keep policy, and its result re-creates a slot under the cleared ancestor (plausible; strong trace, but reachability through a derive round was not executed).**
- Where: `resolveInactiveValue.ts:26-36` derives the policy only from the node's own top exit. `applyInactiveValues.ts:18-21` writes the result with `writeSlotPath`, which creates overlays for absent addresses by design.
- Evidence (trace): use these fields.
  - `flag` is a boolean.
  - `open` has `controls.derived: '../flag'`.
  - `group` has `active: '../open'` and `unsetOnInactive: true`.
  - `group/x` has `active: '#/flag'` and an `inactiveValue`.
  Writing `flag = false` makes `x` a pending exit during calculation. `group` becomes a pending exit after the derive round. Gate exits are never pruned from `pendingExits`; only perished ones are (`finalizePerished.ts:51-60`). In `finalizeExits`, `x` is its own top exit. `readDepartingAncestorPolicy` still sees `group` live with its declaration selected, so `clear` is false and the resolver runs. Retention then clears `x` inside `group`'s overlay and drops `group`'s slot. But `applyInactiveValues` writes `/group/x` through `writeSlotPath`, which re-creates `root.inactiveSlotOverlays[group]` holding `x`. As a result, `inactiveValues` and re-entry show a value under an ancestor with `unsetOnInactive: true`, which breaks rule 5. Both processing orders give the same result.
- Fix spec:
  1. Add this test to `src/core/engine/settle/__tests__/settle.inactive-value.edges.test.ts`:
     ```ts
     it('does not resolve a descendant whose clearing ancestor exits in a later wheel', () => {
       const resolver = vi.fn(() => 'X');
       const { root } = makeFieldNodeTree({
         type: 'object',
         properties: {
           flag: { type: 'boolean' },
           open: { type: 'boolean', controls: { derived: '../flag' } },
           group: {
             type: 'object',
             controls: { active: '../open', unsetOnInactive: true },
             properties: {
               x: { type: 'string', controls: { active: '#/flag', inactiveValue: resolver } },
             },
           },
         },
       });
       root.setValue({ flag: true, open: true, group: { x: 'before' } });
       root.find('/flag')!.setValue(false);
       expect(root.find('/group')).toBeNull();
       expect(resolver).not.toHaveBeenCalled();
       expect(root.inactiveValues).toEqual([]);
       root.find('/flag')!.setValue(true);
       expect(root.find('/group/x')!.value).toBeUndefined();
     });
     ```
  2. If the test passes on the current head, keep it as a regression guard and record P2-2 in `b12-results.md` as unreachable through derive. If it fails, replace `resolveInactiveValue.ts:26-33` with a walk to the outermost exiting ancestor:
     ```ts
     let outer = exit;
     for (
       let ancestor = exit.parent;
       ancestor?.parent && ancestor.parent.structure?.[ancestor.name] !== ancestor;
       ancestor = ancestor.parent
     )
       outer = ancestor;
     if (
       outer !== exit &&
       (context.entered.has(outer) || context.throwingGateExits?.has(outer))
     )
       return;
     const lineage: Self[] = [];
     for (
       let ancestor: Self | null = node;
       ancestor && ancestor !== outer.parent;
       ancestor = ancestor.parent
     )
       lineage.push(ancestor);
     let clear = readDepartingAncestorPolicy(context, outer);
     ```
     Then add one settle DETAIL sentence: "A descendant exit inherits the policy of the outermost ancestor that leaves in the same call."
- Verify: the new test passes. All `settle.inactive-value*` tests pass, including the explicit-keep case at `settle.inactive-value.edges.test.ts:94` and the compacted-array cases at `:163` and `:192`. `settle.error-gate-exits` also passes.

## P3

**P3-1. The new constant is unused (confirmed).** `CONTROL_KEY.inactiveValue` (`src/core/engine/constants/controlKey.ts:14`) has no reader. The readers use the string literal instead: `readInactiveValueDeclaration.ts:26,28`, `collectInactiveValueWarnings.ts:23`, `validateControlGroups.ts:64` and `markInactiveValueNodes.ts:20,31`. The siblings read `CONTROL_KEY.unsetOnInactive`, for example `readExitLayerPolicy.ts:32` and `prepareControlLayers.ts:50`. Fix: replace each literal with `CONTROL_KEY.inactiveValue`, imported from `constants/controlKey`.

**P3-2. A stale cleanup removes a newer registration (confirmed by trace).** The bug is at `src/core/engine/write/utils/read/onInactiveFieldNode.ts:22-25`. Sequence: `u1 = node.onInactive(a); u1(); node.onInactive(b); u1();`. The second `u1()` sees its own empty Set and deletes `b`'s Set from the map, so `b` never runs. The TSDoc at line 10 claims an idempotent cleanup. `subscribeFieldNode.ts:23-26` has the same pattern from before this range. Fix: change line 24 to `if (!subscriptions.size && listeners.get(node) === subscriptions) listeners.delete(node);`. Add a test to `src/core/surface/__tests__/surface.onInactive.test.ts` that runs the sequence above, closes the gate, and expects `b` to be called once.

**P3-3. An `onError` reporter that writes recurses until the stack overflows (confirmed by trace; it requires a reporter that writes on every record).** `enterFieldNodeChain.ts:19` refuses the write before `assertNotInDelivery` at `:22`. `refuseInactiveResolverWrite.ts:16-29` then delivers the warning while `reportingErrors` is set. A reporter that writes to the form on each record re-enters the refusal and delivers again, until a RangeError is swallowed by `reportOwnerlessError`. Without B12, the reporter's live write would have thrown `WriteInObserver` once. Fix: after the `resolvingInactiveValue` check in `refuseInactiveResolverWrite.ts`, add `if (node.runtime.reportingErrors) return true;`. Add a test in `dispatch.inactive-resolver.test.ts` with a reporter that calls `root.find('/stable')!.setValue('x')`. Expect exactly one `WriteInInactiveResolver` report per resolver write and no ownerless error.

**P3-4. The documentation omits that the triggering write throws (confirmed).** `dispatch.inactive-resolver.test.ts:103-118` and `surface.onInactive.test.ts:175` show that a thrown resolver makes the triggering write throw `FormErrorCode.ExpressionThrew` and report it to `onError`. `docs/en/SPECIFICATION.md:472` and the Korean counterpart say only that a settlement failure is recorded and that the exit commits. Fix: add one sentence to both languages: "The write that caused the exit then reports `FormErrorCode.ExpressionThrew` to `onError` and throws it, as a failed expression does."

**P3-5. An explicit caller value in the closing write is discarded without a decision (confirmed; the contract does not address it).** At `settle.inactive-value.test.ts:66-73`, `setValue({ open: false, group: { value: 'written during exit' } })` retains the resolver's `'after'`. The resolver sees only `'before'` and never sees the caller's value. Ask the coordinator to confirm this precedence, then add one sentence under "Retained Value at Exit" in both SPECIFICATION files.

**P3-6. The cost statement undercounts slightly (confirmed).** `finalizeExits.ts:48-50` performs the two promised property checks. `createExitSlotOverlay.ts:91` adds one `context?.inactiveValueOverrides` read for every non-cleared retained node, and `finalizeExits.ts:110` adds one read per call. Neither allocates or performs a lookup. Fix: add both reads to the settle DETAIL cost sentence.

**P3-7. Some contract clauses lack tests (confirmed).** No test covers a wrong-kind result, such as `inactiveValue: 42` on a string node; rule 6 promises misfit retention for that case. Clause (d) is covered only by negative regression guards that would pass without the feature: `settle.inactive-value.edges.test.ts:10`, `surface.onInactive.test.ts:93` and `e2e/inactive-value.render.test.tsx:33`. This is inherent to the clause. The undefined case at `settle.inactive-value.test.ts:76` is the same kind of guard. Fix: add the wrong-kind test with the same assertions as the existing B11 wrong-kind inactive JSON write test.

**P3-8. Two commits carry unrelated or mislabelled changes (confirmed).** `blueprint/types/node.ts:1-6`, `settle/types/settlement.ts:1-25` and `record/types/runtime.ts:1-17` reformat imports that predate this range (whitespace only). Commit `60a4f3fb8`, labelled `test(...)`, also carries the `finalizeExits` cost reordering and the conditional `applyInactiveValues`. Both are behaviour-neutral. No code fix is needed; name both in the PR body.

**P3-9. Commands outside the four refused families still run inside resolvers (confirmed; not a contract violation).** `setState`, `setSubtreeState`, `setExternalErrors`, `clearExternalErrors`, `request` and `validate` do not pass through `enterFieldNodeChain`, so they still run inside a resolver (for example `dispatchSetState.ts:20-44`). The contract refuses only setValue, the array verbs, batch and resetSubtree. Fix: state in both SPECIFICATION files that only those four families are refused, or ask the owner whether the state commands should be refused too.

## Checked and clean

1. **One interface.** `InactiveValueContext` is `InjectToContext<…>`, so it has the same eight fields (`types/controls.ts:26-29`). `InactiveValueResolver<V>` and `InactiveValue<V>` match the contract (`:31-44`). `resolveInactiveValue` builds `inputs` and `value` once. It passes the same objects to every listener and to the declaration through one function, `callInactiveValueResolver`. Every field comes from `previousEmit`, `previousContext` or `originalSchemas`, with the rekey exception in P1-1 and the key-type gap in P2-1.
2. **Key acceptance.** `CHILD_CONTROL_KEY_SET` gains `inactiveValue` (`validateControlGroups.ts:125`), giving ten child keys and fourteen node keys. `EXPRESSION_CONTROL_KEYS` is unchanged. A string or any other non-function is returned as a literal (`callInactiveValueResolver.ts:26`). One warning member, `InactiveValueWithUnsetOnInactive`, fires only for literal `true` (`collectInactiveValueWarnings.ts:22-31`), across the node, fields and fragment layers. The tests list the new members explicitly: public surface 97, `FormWarningCode` length 20, and the ledger test.
3. **Resolution at exit.** The resolver is called in the detach loop before `detached = true` (`finalizeExits.ts:48-57`), as the owner decision "called before detachment" requires. The write happens after `retainExitedSlot` (`:101-109`) at `:110` and before `finalizeRestoredSlotRaw` at `:112`.
   - Listeners run in registration order over a copy with a `has` check, and the last non-undefined result wins. A throw cancels the whole override, including the declaration (`resolveInactiveValue.ts:43-75`).
   - The nearest layer wins in the order node, fields, fragment. Within a layer the last authored value wins, and undefined never falls through to a lower layer.
   - The result is written with `whole = true`. Ancestors are written first through a depth sort (`applyInactiveValues.ts:15-17`).
   - Exclusions are suppressed automatic writes, exceeded budget, rekeyed exits, load scope, entered-only exits and throwing gates (`finalizeExits.ts:48-56`), plus the clear policy (`resolveInactiveValue.ts:26-36`). Form disposal, array deletion and the re-entry instance never reach the resolver.
   - An unconfigured exit costs the two checks at `finalizeExits.ts:49-50`; see P3-6.
4. **`onInactive`.** It is declared on `NodeSurface` (`type.ts:137`) and on `FieldNode` (`FieldNode.ts:376`). Storage is a Map from node to Set (`runtime.inactiveListeners`), and disposal clears it. Registration is bound to the instance and is not copied to the clone. The cleanup has the `subscribe` shape and inherits P3-2. A throw cancels the override and calls `recordSettlementFailure` (`callInactiveValueResolver.ts:31-42`).
5. **Write refusal.** `enterFieldNodeChain.ts:19` covers setValue, the six array verbs, batch (its callback does not run) and resetSubtree. Detached resetSubtree and detached writes route through the same warning (`dispatchResetSubtree.ts:21-24`, `refuseDetachedWrite.ts:16`). Production stays silent: the warning is behind a `NODE_ENV` guard, and the bundle test checks ESM, Node ESM and CommonJS. The flag is restored in a `finally` block (`callInactiveValueResolver.ts:43-45`). Writes after resolution go through, as `dispatch.inactive-resolver.test.ts:122` shows.
6. **Tests per clause.** Each would fail without the implementation unless noted in P3-7.
   - (a) literals `settle.inactive-value.test.ts:9`, function context and previous value `:37`, layer order `:92`.
   - (b) single call, re-entry value and the new instance not called `surface.onInactive.test.ts:9`; unsubscribe `:35`; refusal with 11 warnings and commit +1 `dispatch.inactive-resolver.test.ts:6`; production silence in `detached.production.test.ts`; throw `dispatch.inactive-resolver.test.ts:77` and `surface.onInactive.test.ts:155`.
   - (c) listener over declaration `surface.onInactive.test.ts:55`; descendant over ancestor `settle.inactive-value.test.ts:127`; nearest layer only `settle.inactive-value.edges.test.ts:46`.
   - (d) negative guards only; see P3-7.
   - (e) `blueprint.inactive-value.test.ts:37`, `:16` and `:7`. The `:16` test asserts only that nothing throws, which is the right check for key acceptance because it failed with `UNKNOWN_GROUP_KEY` before the change.
   - (f) public surface, enum and ledger tests.
   - The cost spy is `settle.inactive-value.cost.test.ts`, which follows an existing pattern in `settle.recursive-fill.test.ts`.
   - All tests sit in the fractal they verify. The e2e tests import the package entry.
7. **Delivery corpus.** Both runners show 79 scenes and 429 observation points with 0 differences. The mount corpus has 6 scenes and 12 phases, all the same. There are 6 extension scenes with 18 phases, all marked `stageHeadSupportsContract: false` and run only on the candidate bundle (`tools/b4-2/delivery.mjs:428`).
8. **Documents.** Every changed fractal has its DETAIL in the same commit as its code. The English and Korean SPECIFICATION files cover the controls table beside `injectTo`, the node section and the migration line. The declaration diff (`raw/b12/candidate-f69aa13/declarations/difference.json`) reports 94 to 97 names, three types, `FormWarningCode` changed, `onInactive` and `inactiveValue`, with the zero-difference gate waived.
9. **Hygiene.** No machine-local path, co-author line or session line appears in the diff or the commit messages, and every author is Vincent Kelvin. There is no `as any`, `as never` or `@ts-ignore`. The code uses the winglet helpers and English TSDoc. Each file exports one function, and the only helper, `mark`, has a three-line body.
10. **Results document.** It reports passing gates on `f69aa1388`: unit 591/3,930, render 132/768, storybook 100/251, react18 132/768, production 10/21, verify 728/4,742, plus build, typecheck, lint, isolation and first write. It also records the declaration diff, the corpus counts above, FCA FAIL/indeterminate with the same 202 findings as B11 and 0 new, and a pending window. It is stale in two places. It calls the rekey issue an unexecuted hypothesis, while `raw/b12/window-1-invalid/invalid.json` classifies the candidate as invalid. Its links point to `raw/b12/gates/` and its siblings, which now live under `raw/b12/candidate-f69aa13/`.

## Delta — `014946bbc` "fix(schema-form): resolve moved exits from their committed address"

Scope: `git diff f69aa1388..014946bbc`, ten files. Read-only trace; no test was run.

**Does it resolve P1-1? Yes (confirmed by trace).**
- `getInactiveValueContext.ts:19-23` takes the first `pathChanges` entry of the node and of its parent. `dataPath` and the `parentValue` read now use `previous` from those entries.
- `resolveInactiveValue.ts:38-42` now reads `value` at `inputs.dataPath`.
- The first entry is the previous-commit address. Only `applyArraySplice.ts:120` and `applyArraySlots.ts:186` write `pathChanges`. Exactly one of them runs per arrange settlement (`arrangeFieldNodeItems.ts:146-151`), and the scratch is cleared at release (`releaseSettlementScratch.ts:28`). So a node has at most one entry per settlement, and `previousEmit` belongs to the same commit as that entry's address.
- `getInactiveValuePath` is unchanged, so the result is still written at the current retained address. The rekey test expects `/rows/0/note` to hold `n1-exit`.
- Committed declaration IDs and rule values were already rekeyed during the arrange step. `rootValue` does not depend on paths. No other `previousEmit` read by path remains in B12 code.

**New leaks: none (confirmed).** `pathChanges` and the new `previousSchema` references are per-settlement scratch and are cleared at release. The commit adds no runtime field, node field or retained index.

**Are the regression tests load-bearing?** `settle.inactive-value.rekey.test.ts` is partly load-bearing.
- Load-bearing assertions:
  - `value`, `dataPath`, `parentValue` and `root.inactiveValues` in the first test, for both declaration and listener sources.
  - The value list, the `dataPath` lookup and `inactiveValues` in the three-row test.
  - On `f69aa1388` these read `n0`, `/rows/0/note`, the removed row and `n0-exit`. In the three-row test they read `[n0, n1]`.
- Not load-bearing assertions:
  - `jsonSchema` and `parentJSONSchema` identity pass on `f69aa1388` too, for the reason given in P1-1.
  - `rootValue` does not depend on paths.
- The tests cover only the splice producer (`rows.remove(0)`). No test drives the `applyArraySlots` producer into an exit.

**New findings in the delta:**

**P3-10. The schema capture is redundant but costs something on every array move (confirmed by trace).**
- Where: `applyArraySplice.ts:113-114` and `applyArraySlots.ts:179-180` run `context.originalSchemas.get(former) ?? descendant.schema` and store a fourth `previousSchema` field. They do this for every moved descendant of every splice or slot rearrangement, including forms that never use B12.
- Evidence: at arrange time `originalSchemas` is always empty, because it is cleared at release and filled only during compute, after the move. So the lookup always misses and `previousSchema` is always the same object that `originalSchemas.get(<new path>) ?? node.schema` already returns at resolve time. The arrange DETAIL declares the cost, but it buys nothing in the current flow.
- Fix:
  1. Delete the two capture lines and the `previousSchema` property in both producers.
  2. Delete the `previousSchema` field in `record/types/runtime.ts` and `settle/types/settlement.ts`.
  3. Delete the `previous?.previousSchema?.schema ??` and `parentPrevious?.previousSchema?.schema ??` prefixes in `getInactiveValueContext.ts`.
  4. Delete the record DETAIL bullet and the arrange DETAIL bullet. Reword the settle DETAIL bullet to say that schemas are read at the current path, because `originalSchemas` is keyed after the move.
- Verify: the rekey tests stay green, including both schema identity assertions. If either identity assertion fails, restore the capture as committed and add one settle DETAIL sentence that names the case it covers.

**P3-11. The address lookup scans linearly per resolved node (confirmed).**
- Where: `getInactiveValueContext.ts:19-21` runs two `Array.prototype.find` scans over `pathChanges` for every resolved node. It also allocates two closures even when `pathChanges` is empty.
- Evidence: a head splice over N rows with k configured descendants each costs about 2·(N·k)² comparisons when they all exit. The settle DETAIL states no cost for this.
- Fix: in `settle/types/settlement.ts`, add `/** First pre-move address per moved node, built once by the first exit resolver that needs it. */ inactivePathOrigins?: Map<Self, string>;`. In `getInactiveValueContext.ts`, add an unexported helper:
  ```ts
  const readPathOrigins = <Self extends FieldNodeRecord<Self>>(
    context: SettlementContext<Self>,
  ): Map<Self, string> => {
    if (context.inactivePathOrigins) return context.inactivePathOrigins;
    const origins = new Map<Self, string>();
    for (const change of context.pathChanges)
      if (!origins.has(change.node)) origins.set(change.node, change.previous);
    return (context.inactivePathOrigins = origins);
  };
  ```
  Then use `const origins = context.pathChanges.length ? readPathOrigins(context) : undefined;`, `origins?.get(node) ?? node.path` and `parent ? (origins?.get(parent) ?? parent.path) : ''`. State the cost in the settle DETAIL: one map built per settlement with moves and exit resolvers.
- Verify: the rekey and `settle.inactive-value*` tests stay green.

**P3-12. Test gap and unrelated formatting in the delta (confirmed).**
- No test drives the `applyArraySlots` producer into an exit. Add one rekey test that reaches `applyArraySlots` instead of the splice path, then assert `value` and `dataPath` as in the first rekey test.
- `applyArraySplice.ts:1-15,64,77` reorders imports and removes parentheses that predate this work. This is whitespace and style only. Name it in the PR body, as in P3-8.

**Hygiene of the delta:** the author is Vincent Kelvin. The commit message has no co-author or session line. The diff has no machine-local path and no casts. Each changed fractal's DETAIL is in the same commit.

## Pending gates

- All final-head gates on the follow-up head: build, typecheck, lint, the five projects, verify, the declaration diff, the isolation test and the first-write test.
- The corpus rerun with the new rekey scene count.
- One new window, A as the stage head and B as the follow-up head. Pass needs TEST-073 main 0, `switch-oneOf-80` and `switch-siblings-0` ledger totals within A's width, and the Node heap median of B at or below A's maximum. Record `finalizeExits` self time. Retention numbers are not yet recorded.
- A delta review of any later commit that applies P2-1 or P2-2.

## Unverified

- P2-1 was not compiled.
- P2-2 reachability through a derive round was not executed.
- The cost spy depends on vitest namespace spying, which follows an existing repository pattern.
- The same rekey path mismatch plausibly affects B11's detached watch reads (`finalizeExits.ts:58-65` uses `originalSchemas.get(departing.path)` and watch reads relative to the current path). That code predates B12, is out of scope and was not traced to completion.

## Delta 2 — `014946bbc..31ff8741c`

Reviewed head: `31ff8741c`. It landed during this review, and the review is pinned to it. Static review only: git, grep and file reads. No build, test, typecheck or lint was run. The worker's untracked red and green logs under `raw/b12/review-fixes/` were read as supporting evidence. Paths are relative to `packages/canard/schema-form/`.

Commits in the range:
- `8caa76c23` fix(schema-form): honor exit inputs and final ancestor policy
- `39629cd4d` fix(schema-form): restore inactive resolver type import
- `e9fe84669` test(schema-form): verify rekey dispatch within array boundary
- `77a86d127` test(schema-form): record the inactive key declaration signature
- `4ad8e49f0` test(schema-form): serialize the key type in declaration evidence
- `31ff8741c` fix(schema-form): honor whole ancestor inputs at exit

**Verdict for `31ff8741c` (delta 2): CONDITIONAL PASS — P1 0 / P2 1 / P3 5.** Both prior P2 findings are resolved. Do not merge `31ff8741c` as is. Merge needs two conditions:
- P2-3 lands with its two failing-first tests.
- The pending gates listed at the end of this section pass on the fixed head.

### Prior P2 items

**P2-1 is resolved (confirmed by diff and the worker's red log).**
- `src/core/engine/types/controls.ts:66-73` declares `InactiveValueResolver<unknown> | string | number | boolean | null | object`. The union keeps exactly one call-signature member, so an inline `(value, context) => …` receives the resolver signature as its contextual type.
- The type test is `src/__tests__/e2e/inactive-value.type.test.ts:11-23`. It is load-bearing. `p2-type-red.log.gz` shows TS7006 on both parameters and TS2344 on both `toEqualTypeOf` lines against the old key type.
- `tools/b12/declarations.mjs` now asserts a union with one call-signature member and records the key type string (`77a86d127`, `4ad8e49f0`). The rerun output is not committed yet.

**P2-2 is resolved (confirmed by trace and the worker's red log).**
- `resolveInactiveValue.ts:27-33` walks to the outermost ancestor that has left its parent's structure. That is the same liveness test as `finalizeExits.ts:40`.
- `:35-39` skips when that ancestor is entered-only or a throwing gate. `:40-50` derive the policy from it.
- Trace for the test's tree: the old code read the policy from the parent of `x`, which is `group`. `group`'s declaration is still selected, so `clear` stayed false and the resolver ran. The new code reads `group`'s own `unsetOnInactive: true` through `readSlotExitPolicy`, so `clear` is true.
- The test at `settle.inactive-value.edges.test.ts:10-36` is load-bearing. `p2-policy-red.log.gz` shows "expected spy to not be called, but called 1 times". The explicit-keep descendant case in the same file stays green.

### Explicit-value precedence (P3-5 decision, contract rule 6)

The check is `hasExplicitInactiveValue(node, outer, context)` at `resolveInactiveValue.ts:34`. It runs before any resolver.

**Caller `setValue` outside a batch is correct (confirmed by trace).**
- Coverage reads `context.kind`.
- A whole ancestor inside the departing subtree covers omitted descendants (`hasExplicitInactiveValue.ts:39-50`).
- A merge descends and covers only keys that are present (`:53-56`).
- An omitted departing subtree returns false, so the resolvers run.
- This matches the engine, where a merge outside a batch is deep (`markWrite.ts:57,124-125`).

**Tests:**
- Whole and merge: `settle.inactive-value.explicit.test.ts:7-33`.
- Batch omitted and batch explicit: `:35-61`.
- Root omission: `:63-79`.
- Leaf explicit value with both resolver forms: `settle.inactive-value.test.ts:76-99`.
- The whole case is load-bearing against `8caa76c23`. `ancestor-explicit-red.log.gz` shows the resolver called once where zero calls were expected.
- The leaf case is load-bearing against `014946bbc` (`explicit-red.log.gz`).

**Array verbs are unaffected (confirmed).** Splice and slot settlements never record the array host in `writtenInputs`, so the check returns false and the rekey tests keep resolving.

Two paths are wrong: a merge from a form input (P2-3) and a merge inside a multi-write batch (P3-13).

### New findings

**P2-3. A merge from a form input is treated as a whole write, so the resolvers of omitted descendants are skipped (confirmed by trace; not executed).**
- Where: `src/core/engine/settle/utils/inactive/hasExplicitInactiveValue.ts:40-50`, with `readCallerOrigin` at `:67-88`.
- Evidence: `readCallerOrigin` returns the binding delivery origin. `settle/types/settlement.ts:134-135` documents that origin as independent of merge and replacement.
- Every form-input write follows the same path: `FieldInputSlot.tsx:80` calls `writeFieldNodeInput`, then `dispatchWriteInput.ts:25-26` marks the write in a batch with `source: 'input'`.
- `flushBatchWrites.ts:54` records the origin as `'input'`, even for a Merge.
- The settlement itself is a deep merge, because `kind` is `callerPartial`. But line 45 reads `'input' !== 'callerPartial'` as a whole write and returns true.
- Failure scenario: take the schema from `settle.inactive-value.explicit.test.ts:11-23`. An object input calls `onChange({ open: false, group: {} }, SetValueOption.Merge)`. `group` leaves. The deep merge keeps `x` at `'before'`, and the resolver never runs. Rule 6 says a merge covers only the keys present, so the resolver should run and `x` should re-enter as `'resolved'`.
- A whole write from a form input is unaffected.

**P3-13. Inside a multi-write batch, a received key below a merge is replaced whole, but the check treats it as a merge (confirmed by trace; not executed).**
- Evidence: a multi-write batch merges shallowly (`write/utils/chain/utils/replaceAtPath.ts:6-20`).
- `collectReplacePaths.ts:21-23` adds each received key as a whole-replacement path, and `markWrite.ts:124-129` writes it whole.
- But `readCallerOrigin` returns `callerPartial` for every position under the origin.
- Failure scenario: in `root.batch(() => { root.setValue({ open: false, group: {} }, WriteOption.Merge); root.find('/stable')!.setValue('next'); })`, `x` is written `undefined`. The resolver still runs and retains `'resolved'`. The contract says a whole ancestor covers its omitted descendants.
- The fix is shared with P2-3.

**P3-14. The key type still accepts an annotated function of any signature (plausible; not compiled).**
- The `object` member at `controls.ts:73` accepts every function, so `inactiveValue: (value: number) => value + 1` compiles, and so does a function with three parameters.
- The inline unannotated case named in P2-1 is fixed.
- Fix: record it as a follow-up in `b12-results.md`.
- If it is fixed now instead, replace `object` with `Readonly<Record<string, unknown>> | readonly unknown[]` and add `// @ts-expect-error` for `(value: number) => value`. Keep that change only if typecheck reports the expected error. The existing type tests and the public surface snapshot must stay green.

**P3-15. One formatting residue remains (confirmed).**
- The import blocks in `blueprint/types/node.ts`, `record/types/runtime.ts`, `settle/types/settlement.ts` and `applyArraySplice.ts` now match `4d0fa4a12`.
- The `pathChanges` element type is still split over five lines at `record/types/runtime.ts:151-155` and `settle/types/settlement.ts:294-298`. The removed `previousSchema` field left this whitespace-only change behind.
- Fix: restore `pathChanges: { node: Self; previous: string; current: string }[];` on one line in both files.
- Verify: `git diff 4d0fa4a12..HEAD` for both files shows only B12 fields.

**P3-16. `8caa76c23` alone does not typecheck (confirmed by diff).**
- It dropped `import type { InactiveValueResolver }` from `record/types/runtime.ts`, while `inactiveListeners` at `:246` still uses it. `39629cd4d` restores the import.
- This affects only history and bisect, not runtime.
- Fix: name it in the PR body. Squash `39629cd4d` into `8caa76c23` only if the coordinator rewrites the branch.

**P3-17. The `subscribe` twin of P3-2 is neither applied nor recorded (confirmed).**
- `write/utils/read/subscribeFieldNode.ts:25` still deletes the map entry without checking that the entry holds its own Set. This code predates B12.
- Fix: add one follow-up line to `b12-results.md`. Applying the same guard is outside B12 scope unless the coordinator asks for it.

### Fix spec for P2-3 and P3-13

1. Create `src/core/engine/settle/utils/inactive/readExplicitWriteKind.ts`.
   - Move `readCallerOrigin` there and export it as `readExplicitWriteKind`, with the same parameters and the same matching loop.
   - It gets its own file because its body exceeds the eight-line helper budget.
   - Change only the return statements:
   ```ts
   const origins = context.writeOrigins;
   if (!origins) return context.kind;
   // …unchanged matching loop over origins…
     if (origin.source === 'automatic') return 'automatic';
     if (!origin.keys) return 'callerReplace';
     // A single-write merge is deep; a batched merge is shallow, so a received key is replaced whole.
     return origins.length === 1 || inputPath === path ? 'callerPartial' : 'callerReplace';
   // …after the loop…
   return undefined;
   ```
   - Set the TSDoc `@returns` to: "Coverage at this position: `callerPartial` covers only supplied keys, `callerReplace` covers omitted descendants, `automatic` never counts, and `undefined` lies outside every caller origin."
2. In `hasExplicitInactiveValue.ts`:
   - Call `readExplicitWriteKind(context, current.path)` at `:40`.
   - Delete the old helper.
   - Remove the imports that only the old helper used: `getChildPointer`, `isDescendantPath`, `readPointerSegment` and `FieldNodeWriteKind`.
3. Add two tests to `src/core/engine/settle/__tests__/settle.inactive-value.explicit.test.ts`, importing `import { dispatchWriteInput } from '../../write';`.
   ```ts
   it('treats a form input merge like a caller merge', () => {
     const resolver = vi.fn(() => 'resolved');
     const { root } = makeFieldNodeTree({
       type: 'object',
       properties: {
         open: { type: 'boolean' },
         group: {
           type: 'object',
           controls: { active: '../open' },
           properties: { x: { type: 'string', controls: { inactiveValue: resolver } } },
         },
       },
     });
     root.setValue({ open: true, group: { x: 'before' } });
     dispatchWriteInput(root, { open: false, group: {} }, WriteOption.Merge);
     expect(resolver).toHaveBeenCalledTimes(1);
     root.find('/open')!.setValue(true);
     expect(root.find('/group/x')!.value).toBe('resolved');
   });

   it('treats a received key below a batched merge as a whole input', () => {
     const resolver = vi.fn(() => 'resolved');
     const { root } = makeFieldNodeTree({
       type: 'object',
       properties: {
         open: { type: 'boolean' },
         stable: { type: 'string' },
         group: {
           type: 'object',
           controls: { active: '../open' },
           properties: { x: { type: 'string', controls: { inactiveValue: resolver } } },
         },
       },
     });
     root.setValue({ open: true, stable: 'before', group: { x: 'before' } });
     root.batch(() => {
       root.setValue({ open: false, group: {} }, WriteOption.Merge);
       root.find('/stable')!.setValue('next');
     });
     expect(resolver).not.toHaveBeenCalled();
     root.find('/open')!.setValue(true);
     expect(root.find('/group/x')!.value).toBeUndefined();
   });
   ```
   If the second test's re-entry assertion fails while its resolver assertion passes, stop and report. Do not change the assertion.
4. Update the documents.
   - Settle DETAIL, explicit-value bullet. Append: "폼 입력의 merge도 호출자 merge와 같이 실제 키만 덮고, 여러 쓰기 batch의 merge는 얕으므로 받은 키 아래 위치는 whole로 봅니다."
   - `docs/en/SPECIFICATION.md`, section "Retained Value at Exit". After the merge sentence, add: "A merge from a form input follows the same rule. Inside a multi-write batch a merge is shallow, so a supplied key replaces its subtree whole."
   - `docs/ko/SPECIFICATION.md`, same place. Add: "폼 입력의 merge도 같은 규칙을 따릅니다. 여러 쓰기를 묶은 batch의 merge는 얕으므로 명시된 키는 그 서브트리를 whole로 교체합니다."
5. Verify in this order.
   - On `31ff8741c`, the first new test fails with 0 calls and the second with 1 call. Save both red logs beside the existing ones.
   - After the change, both new tests pass.
   - These stay green: `settle.inactive-value*`, `arrange.inactive-value-rekey`, `dispatch.inactive-resolver`, `surface.onInactive`, `importModel` and the B12 delivery scenes.
   - Then run the final-head gates.

### Other requested checks (clean)

1. **The first delta's P3 items are resolved.**
   - The duplicate `previousSchema` capture is gone from both producers and from both types. `applyArraySplice.ts` is byte-identical to `4d0fa4a12`. Array moves in forms without B12 pay nothing extra.
   - `getInactiveValueContext.ts:19-23,52-60` builds one map per settlement, and only when moves exist.
   - The map cannot leak, because `createSettlementContext.ts:35` creates a fresh context for every settlement.
   - The map cannot go stale. Only the two arrange producers push `pathChanges`, and both run before `finishSettlement.ts:77`.
   - The slot-producer test lives in the owning fractal at `settle/arrangeFieldNodeItems/__tests__/arrange.inactive-value-rekey.test.ts`. It imports only its own `utils/` and the engine `types`.
   - `e9fe84669` removed the cross-fractal imports from the settle rekey test. That test's net diff over the range is zero.
   - `importModel` is green in `import-placement-green.log.gz`.
   - The slot test's assertions run inside the resolver and throw there, so the test would fail on `f69aa1388`.
2. **The worker-reported fixes hold.**
   - Stale cleanup: the fix is at `onInactiveFieldNode.ts:24-25`, and the test is at `surface.onInactive.test.ts:127-145`. The red log shows 0 calls.
   - Reporter recursion: the fix is at `refuseInactiveResolverWrite.ts:15`, and the test is at `dispatch.inactive-resolver.test.ts:122-161`. The red log shows 628 calls.
   - Outside a resolver, line 14 returns first, so behaviour there is unchanged.
3. **No product runtime change in the non-fix commits.**
   - `39629cd4d` adds one type-only import.
   - `e9fe84669` touches only tests.
   - `77a86d127` and `4ad8e49f0` touch only verification tooling.
   - `31ff8741c` does change product code and is reviewed above.
4. **Hygiene is clean.**
   - No machine-local path, co-author line or session line appears in the diff or the commit messages.
   - Every author and committer is Vincent Kelvin with the noreply address.
   - There are no casts and no suppressions.
   - The untracked red logs use a `<repo>` placeholder instead of local paths.
5. **Status of the twelve earlier P3 items.**

| Item | Status |
|---|---|
| P3-1 constant | Applied in five product files. `callInactiveValueResolver.ts:40` keeps the literal only inside a failure key. |
| P3-2 stale cleanup | Applied with a test. The `subscribe` twin is still open; see P3-17. |
| P3-3 reporter recursion | Applied with a test. |
| P3-4 throw sentence | Applied in English (`SPECIFICATION.md:472`) and in Korean. |
| P3-5 explicit value | Decided as rule 6 and implemented with tests and docs. P2-3 and P3-13 remain. |
| P3-6 cost sentence | Applied in the settle DETAIL. |
| P3-7 wrong-kind test | Applied with an object value. A numeric literal is converted to a string, so it would not be a misfit. |
| P3-8 mislabelled commit | Recorded in `b12-results.md`. The import formatting is reverted. Naming it in the PR body is still pending. |
| P3-9 refusal scope | Applied in English and Korean. |
| P3-10 schema capture | Applied. |
| P3-11 linear scan | Applied. |
| P3-12 slot test and formatting | The test is applied. The formatting is reverted except the residue in P3-15. |

**Correction to the first delta:** it said the rekey tests cover only the splice producer. That was wrong. The spies in `8caa76c23` showed that `rows.remove(0)` goes through `applyArraySlots` in all three tests. No test drives `applyArraySplice` into an exit.

### Unverified (delta 2)

- No test, typecheck, build or lint was run.
- P2-3 and P3-13 rest on traces. Their proposed tests have not been executed.
- It was not traced whether an admitted splice settlement can produce a gate exit at all. The splice code's own comment says admission excludes gates that read positions. If so, the splice-side `pathChanges` read is unreachable for resolvers.
- P3-14 was not compiled.
- The worker's red and green logs are untracked files, not committed evidence.

### Pending gates after delta 2

- The P2-3 fix and its two tests.
- All final-head gates on the fixed head: build, typecheck, lint, the five projects, verify, the declaration diff, the isolation test and the first-write test.
- The corpus rerun.
- One window, with A as the stage head and B as the final head.
- A delta review of the P2-3 commit.

### Delta 2 addendum — rule 6 coverage and whether the whole and merge tests are load-bearing

HEAD is unchanged at `31ff8741c`, so the range is the same. `77a86d127` and `4ad8e49f0` change only verification tooling and its README (`tools/b12/declarations.mjs` and `tools/b12/README.md`). They contain no product code.

**Each clause of rule 6 against the code at `hasExplicitInactiveValue.ts`:**
- **A whole ancestor covers its descendants, and an omitted descendant counts as explicitly undefined.**
  - Code: `:39-50` checks every position at or below the outermost departing node. The first whole position returns true.
  - Status: matches for a caller `setValue`, and for a whole write from a form input.
- **A merge covers only the keys present.**
  - Code: `:53-56` descends into the merge when the kind is `callerPartial`.
  - Status: matches for a caller merge outside a batch. It is wrong for a merge from a form input (P2-3). It is also wrong for a received key below a merge inside a multi-write batch (P3-13).
- **Omitting the departing subtree still runs the resolvers.**
  - Code: positions above the outermost departing node are skipped by `current.depth >= exit.depth`. So a whole root write that omits the subtree still runs the resolvers.
  - Status: matches. The test is `settle.inactive-value.explicit.test.ts:63-79`.

**Whether each test fails without the fix:**
- **The whole case is load-bearing.** It is `merge=false` in `settle.inactive-value.explicit.test.ts:7-33`. `ancestor-explicit-red.log.gz` shows it failing on `8caa76c23`, with 1 resolver call where 0 were expected.
- **The merge case is not load-bearing.** It is `merge=true` in the same test, and it passes on `8caa76c23` too: the same log shows it green.
  - It is a guard against over-coverage, not a failing-first test. It would fail if a caller merge were read as whole.
  - It writes through `root.setValue`, so it does not exercise the form-input path where P2-3 lives. The first test in the P2-3 fix spec covers that path.

The verdict is unchanged: **CONDITIONAL PASS — P1 0 / P2 1 / P3 5.**

## Delta 3 — `31ff8741c..00ed5f3aa`

Reviewed head: `00ed5f3aa`. HEAD moved twice during this review, and the review is pinned to it. Static review only: git, grep and file reads. No build, test, typecheck or lint was run, because workers were running gates. Paths are relative to `packages/canard/schema-form/` unless they start with `tools/`, which means `architecture/verification/branch-switch/tools/`.

Commits in the range:
- `78b467b88` fix(schema-form): distinguish input origin from merge coverage
- `bd7fd658b` test(schema-form): isolate windows from Spotlight indexing
- `85b687d83` test(schema-form): keep the quiet-clock fixture within its helper budget
- `00ed5f3aa` test(schema-form): use the record fixture for input dispatch

**Verdict for `00ed5f3aa` (delta 3): CONDITIONAL PASS — P1 0 / P2 1 / P3 5.** P2-3 and P3-13 are resolved in product code. The new P2-4 is in the measurement device, not in the product. Merge needs three conditions:
- P2-4 lands before the formal window starts.
- The final-head gates pass on `00ed5f3aa` or later. The logs in `raw/b12/gates/` were taken on `31ff8741c` (`counts.json` names that candidate), and there the explicit test file still had 5 tests. The two new tests have not run in any recorded gate.
- One formal window passes, with A as the stage head and B as the final head.

### P2-3 and P3-13 are resolved (confirmed by trace; not executed)

**Coverage now comes from the write, not from the delivery origin.**
- `src/core/engine/settle/utils/inactive/readExplicitWriteKind.ts:21-43` replaces `readCallerOrigin`. The matching loop is unchanged. Only the return values changed.
- An `automatic` origin returns `automatic`. An origin with no keys returns `callerReplace`. A merge returns `callerPartial` when the batch has one origin or the position is the merge target itself. Below the target in a multi-origin batch, it returns `callerReplace`.
- The one-origin condition matches the engine. `flushBatchWrites.ts:27-34` keeps a single write at its own node as a deep merge. `writeFieldNode.ts:87,97` switches to shallow replacement paths only when there is more than one origin. `collectReplacePaths.ts:21-23` adds each received key as a whole path.
- Delivery origin is untouched. `readSettlementSource.ts:23,36` still reads `origin.source` and `context.source`.

**Without origins, the function returns `context.kind` instead of `context.source ?? context.kind`. This is the intended change.**
- `context.source` differs from `kind` only on one path. That path is `dispatchSetValue.ts:54-60`, called with `source: 'input'` when no batch is marking.
- Every other caller of `writeFieldNode` passes no `source`, so the value falls back to `kind`. Those callers are `dispatchFinishInput.ts:43`, `arrangeFieldNodeItems.ts:82,101,121`, `loadFieldNodeAtMount.ts:32` and both reset files.
- The old code read that input path as a whole write even for a merge. That was P2-3 again.

**Tests that existed before keep their outcome (confirmed by trace).**
- Caller whole and merge writes outside a batch take the no-origin path. The value there equals the old one.
- In the batch omitted and batch explicit tests, every origin is a scalar whole write with no keys, so the result is `callerReplace` as before. The omitted case still finds no covering origin.
- Root omission still takes the no-origin `callerReplace` path, and the departing subtree is skipped by depth.
- Array verbs still never record the host in `writtenInputs`.

**Both new tests are load-bearing (confirmed by trace; no red log saved, see P3-18).**
- Input merge, `settle.inactive-value.explicit.test.ts:8-29`. On `31ff8741c` the single origin has `source: 'input'`. `/group` then returns `'input'`, the whole-write condition at `hasExplicitInactiveValue.ts:39` holds, and the resolver is called 0 times where 1 is expected. On HEAD, `/group` returns `callerPartial`, `x` is absent from `{}`, and the resolver runs once.
- Batched merge, `:31-54`. On `31ff8741c`, `/group` returns `callerPartial` under the root merge, so the resolver is called 1 time where 0 is expected. On HEAD, `/group` returns `callerReplace` because there are two origins.
- `b12-results.md:77` reports the same counts, 0 and 1. That matches the trace.

**`00ed5f3aa` changes the fixture only.** The first test now uses `createDispatchTree` and record-level `dispatchSetValue`. It builds the same `fieldNodeFactory` tree, so the engine path is unchanged.

### New findings

**P2-4. The formal B12 window fails at start on a `.noindex` root (confirmed by trace and by the prepared root on disk).**
- Where: `tools/b4-2/verifyInputs.mjs:19` still builds the path as `root + '-stage-' + lane + '/stages/scratch'`.
- `bd7fd658b` moved stage outputs to `getStageRoot(root, lane)`, which gives `<run>-stage-a.noindex` (`tools/b11/prepare.mjs:98-102`). It did not update this reader.
- `tools/b11/window.mjs:32` calls `verifyInputs(root)` before it checks the formal marker. `tools/b6/summarize.mjs:40` calls it too.
- Failure scenario: the prepared root `20261028T2031-00ed5f3-b12-final.noindex` has its stage files in `...b12-final-stage-a.noindex/stages/scratch/`. The verifier reads `...b12-final.noindex-stage-a/stages/scratch/wrapped.mjs`, which does not exist. The window throws ENOENT before `formal-start.json` is written.
- The untimed smoke (`tools/b6/checkLoad.mjs`) never calls `verifyInputs`, so it passed and hid the defect.
- No data is lost and no formal marker is spent. However, the window gate cannot run until this is fixed.
- The other literal stage paths in `tools/b4-1`, `tools/b4-2` (window, summarize, checkTools, prepare) and `tools/b6/window.mjs` belong to earlier devices. They are not on the B11 or B12 path and keep legacy roots.

**P3-18. The two red logs for the new tests are not saved (confirmed).** Step 5 of the delta 2 fix spec asked for them beside the existing logs. `raw/b12/review-fixes/` has no file newer than `ancestor-explicit-green.log.gz`. The results document asserts the reproduction, and the trace above agrees.

**P3-19. `78b467b88` alone probably fails typecheck (plausible; not compiled).** In that commit the first new test passes the `makeFieldNodeTree` root to `dispatchWriteInput`. `fieldNodeFactory` is declared to return the public `FieldNode` (`src/core/surface/utils/fieldNodeFactory.ts:119-128`), while `dispatchWriteInput` requires `Self extends FieldNodeRecord<Self>`. `00ed5f3aa` switches to the record fixture. This is the same kind of history-only gap as P3-16.

**P3-20. The B8 README still states a 120 second maximum for every load (confirmed).** `tools/b8/helpers/waitForQuietProcess.mjs` is now a re-export of the shared policy. B8, B11 and B12 devices therefore allow 600 seconds when only Spotlight-class processes are busy. `tools/b8/README.md:5,44,69` still says 120 seconds.

**P3-21. The shared quiet-clock check imports the policy through the B8 compatibility address (confirmed).** `tools/window/checkQuietProcess/utils/observeQuietProcess.mjs:1` imports `../../../b8/helpers/waitForQuietProcess.mjs` instead of its own sibling module, so the canonical device check depends on the older batch's folder. `tools/b8/checkQuietProcess.mjs` already covers the compatibility address.

**P3-22. The PR body and the results document still name `31ff8741c` (confirmed).** `b12-pr-body.md:5` cites it as the final candidate. The commit list at `b12-results.md:70` stops at `31ff8741c`. Update both after the gates on the new head.

### Fix spec

1. **P2-4.** In `tools/b4-2/verifyInputs.mjs`:
   - After the `node:path` import, add a blank line, then `import { getStageRoot } from '../window/getStageRoot.mjs';`.
   - Replace line 19 with `const stages = getStageRoot(root, lane) + '/stages/scratch';`.
   - Verify:
     - `node <tools>/b4-2/checkTools.mjs` stays green. That covers legacy roots, where `getStageRoot` returns `root + '-stage-' + lane`.
     - `node <tools>/window/checkQuietProcess.mjs` stays green.
     - Run a read-only call of `verifyInputs` on the prepared root above. It must return without throwing. The window does not compare `inputs.json`'s `candidateCommit` with HEAD, so a commit that touches only tools does not require a new preparation.
2. **P3-18.** In a scratch worktree, check out `31ff8741c`. Copy in the HEAD version of `settle.inactive-value.explicit.test.ts` and `src/core/engine/__tests__/fixtures/createDispatchTree.ts` if it is missing. Run that file in the `unit` project. Save the output as `raw/b12/review-fixes/input-merge-red.log.gz`. It must show 0 calls for the input merge and 1 call for the batched merge. Use the `<repo>` placeholder for local paths.
3. **P3-19.** Add one sentence to the PR body next to the `8caa76c23` sentence: "`78b467b88`의 시험은 공개 노드를 레코드 디스패처에 넘겨 단독 typecheck가 실패할 수 있으며 `00ed5f3aa`가 레코드 fixture로 바로잡습니다." Squash only if the coordinator rewrites the branch.
4. **P3-20.** Append to `tools/b8/README.md`: "시작 지연 구현은 공용 `tools/window`로 옮겼으며, 이제 일반 부하는 누적 120초, Spotlight 계열(`mds`, `mds_stores`, `mdworker*`)만 남은 경우 전체 600초까지 기다립니다."
5. **P3-21.** In `observeQuietProcess.mjs`, import `../../waitForQuietProcess.mjs` instead.
6. **P3-22.** After the gates pass, change `b12-pr-body.md:5` to the new head and its counts. Extend `b12-results.md:70` with `78b467b88` (입력 병합 coverage), `bd7fd658b`·`85b687d83` (Spotlight 격리 장치), `00ed5f3aa` (시험 fixture), and the P2-4 commit.

### Checked and clean (delta 3)

1. **`readExplicitWriteKind.ts` follows the rules.**
   - It has one export, and its TSDoc names both parameters and the result. The inline comment is one line and states the deep-versus-shallow invariant.
   - The file has no helper, so the helper budget is not used.
   - It sits flat in `settle/utils/inactive/` beside its single user. Its siblings do the same: `getInactiveValuePath` serves only `applyInactiveValues`, and three others serve only `resolveInactiveValue`. This also matches the package CLAUDE.md rule against per-function `utils/` directories.
   - `hasExplicitInactiveValue.ts` dropped exactly the four imports the old helper used. There are no casts and no suppressions.
2. **The tests import across fractals correctly.** `../../write` is the sibling fractal's entry point, and it exports `dispatchSetValue` and `dispatchWriteInput` by name (`src/core/engine/write/index.ts:1-2`). The record fixture comes from the engine's own `__tests__/fixtures/`. The file has 7 cases.
3. **The documents match the fix spec word for word.** This covers the settle DETAIL bullet and both `SPECIFICATION.md` files.
4. **P3-15 is resolved.** `git diff 4d0fa4a12..HEAD` for `record/types/runtime.ts` and `settle/types/settlement.ts` shows only B12 fields.
5. **The window device meets the brief except for P2-4.**
   - `.noindex`: the B12 `prepare.mjs:4-7` and `window.mjs:3-6` assert the suffix. The B11 root pattern accepts it as optional. `getStageRoot` gives `<run>-stage-<lane>.noindex` and leaves legacy roots unchanged. Bundles, delivery and load checks sit inside the prepared root, as confirmed on disk.
   - 600 seconds applies only when every heavy process is named `mds`, `mds_stores` or `mdworker*` (`tools/window/waitForQuietProcess.mjs:37-48`). Any other heavy process also applies the cumulative 120 second limit.
   - With ordinary load only, the loop matches the removed B8 implementation: same sample, same pauses, same final partial pause, `waitedMs` 120000. `tools/b8/checkQuietProcess.mjs` still holds by trace.
   - `parseCpuSample.mjs:12` keeps `path.basename` of `ps comm`, so real rows carry bare names such as `mds_stores`, and the name test works.
   - No product file changed in `bd7fd658b` or `85b687d83`. The device is shared under `tools/window/`. B11 imports it directly (`tools/b11/window.mjs:11-12`). B12 reaches it through B11, and B8 through a one-line re-export.
6. **Hygiene is clean.** All four commits are authored and committed by Vincent Kelvin with the noreply address. There are no co-author, session or sign-off lines. The added lines contain no `/Users/`, `/private/` or `claude-501` path, and neither does `b12-results.md`.
7. **Status of the delta 2 P3 items.**

| Item | Status |
|---|---|
| P3-13 batched merge | Applied in `78b467b88` with a test. |
| P3-14 key type accepts any function | Recorded as a follow-up at `b12-results.md:74`. |
| P3-15 `pathChanges` formatting | Applied. |
| P3-16 `8caa76c23` alone fails typecheck | Named in `b12-pr-body.md:13`. |
| P3-17 `subscribe` twin | Recorded as a follow-up at `b12-results.md:75`. |
| P3-8 (earlier) mislabelled commits | Now named in `b12-pr-body.md:11`. |

### Unverified (delta 3)

- No test, typecheck, build, lint or device check was run. The two new tests, the quiet-clock check and `checkTools.mjs` rest on traces and the worker's report.
- The red counts rest on the trace and on `b12-results.md:77`, not on a saved log.
- P3-19 was not compiled.
- It was not traced that `createDispatchTree`, which passes no validator, evaluates the `active` gate the same way as `makeFieldNodeTree`. The worker reports the test green.
- The real-clock behaviour of the shared wait was not observed.

## Delta 4 — `00ed5f3aa..7af6a5d3c`

Reviewed head: `7af6a5d3c`. HEAD did not move during this review. Static review only: git, grep and file reads. No build, test, typecheck, lint or device run was started, because a measurement window may start on this machine. Paths are relative to `packages/canard/schema-form/` unless they start with `tools/`, which means `architecture/verification/branch-switch/tools/`, or `design-optimization/`, which means `architecture/verification/design-optimization/`.

Commits in the range. There are three, not five. The documentation changes ride inside `7af6a5d3c`, and the B8 README and quiet-clock edits ride inside `ea2bef3e1`. No device fixture move is committed. A 16-file tools change was being written, uncommitted, in the worktree during this review (see Unverified).
- `d84e74d5a` test(schema-form): verify the prepared noindex stage addresses
- `ea2bef3e1` docs(schema-form): align shared quiet policy references
- `7af6a5d3c` fix(schema-form): retain explicit whole coverage across a batch

**Verdict for `7af6a5d3c` (delta 4): CONDITIONAL PASS — P1 0 / P2 1 / P3 3.** The product change is correct by trace, and the final gates ran on this head. Window 3 is no longer pending. It started on this head at UTC 2026-10-28 21:02:27.340 and failed three seconds later on a device path check (P2-5). Its formal marker is spent. Merge needs four conditions:
- The P2-5 fix is committed and gets its own delta review.
- `b12-results.md` records window 3 as a device failure.
- One new window on a new prepared root passes, with coordinator approval, A as the stage head and B as the final product head.
- `b12-results.md` and `raw/b12/` are committed with the PR. They are untracked now. B11 committed its results inside the merge commit `4d0fa4a12`.

### Requested checks

**1. P2-4 is resolved (confirmed by reading).**
- `tools/b4-2/verifyInputs.mjs:6` imports `getStageRoot`, and `:21` builds `getStageRoot(root, lane) + '/stages/scratch'`.
- `tools/window/getStageRoot.mjs:9-11` returns `root + '-stage-' + lane` for a root without `.noindex`, which is byte for byte the old literal. A `.noindex` root gives `<run>-stage-<lane>.noindex`.
- The B4-2, B6, B8 and B11 windows and the B4-2 and B6 summarizers all reach the verifier through this one function. B4-1 has its own verifier and is untouched.
- `raw/b12/review-fixes/device-red`, `device-green`, `device-summary-green` and `device-legacy-green` (`B4_2_TOOL_SMOKE_OK synthetic-only`) are saved.

**2. Batch-union coverage (confirmed by trace; not executed).**
- `src/core/engine/settle/utils/inactive/readExplicitWriteKind.ts:23-29` returns `callerReplace` before the origin loop when `context.replacePaths` holds the position or one of its ancestors.
- `replacePaths` is set only for a multi-write batch (`settle/utils/write/writeFieldNode.ts:87,97`). It is the same scope that `markWrite` and `isReplacedLivePath` use for the real whole replacement. `collectReplacePaths.ts:18-26` skips automatic origins and adds a whole write's path, a shallow merge's received-key child paths and virtual fields. So the new check reads the batch's actual whole coverage.
- **The regression is load-bearing.**
  - On HEAD, the batch writes `/group` whole `{}`, `/group` merge `{}` with keys `[]`, and `/open` false. `replacePaths` is `['/group', '/open']`. At `/group`, which sits at the exit depth, the new check returns `callerReplace`. `hasExplicitInactiveValue.ts:33-44` then returns true, the resolver runs 0 times, and re-entry finds `x` undefined.
  - On `00ed5f3aa`, the loop meets the merge origin first. Because `inputPath === path`, it returns `callerPartial`. The input `{}` is an object, so there is no return at `/group`. `hasDistributedChildInput({}, 'x')` is false, so the function returns false and the resolver runs once.
  - `raw/b12/review-fixes/batch-union-red.log.gz` shows that failure ("called 1 times") with the other seven tests green.
- **The earlier tests keep their outcome (by trace).**
  - Whole and merge are single writes. `writeOrigins` is undefined, so the function returns `context.kind` before the new line.
  - The input merge goes through `dispatchWriteInput`, then `dispatchSetValue`, outside a batch. It has no origins.
  - In the batched merge, `/group` is in `replacePaths` as a received key. That is the same `callerReplace` the loop gave.
  - In the batch omitted and explicit tests, `/value` is in `replacePaths` only when it is written.
  - Root omission is not a batch.
  - The unit and verify gate logs on this head list the file with 8 tests green.
- **There is no regression for caller-only writes.** The new check differs from the loop only when the latest covering origin is a merge whose target is exactly the position. There the loop said `callerPartial`. That is the case this commit fixes, and the engine really does replace that subtree whole in a multi-write batch. So the answer now matches the committed value. The only other difference involves an automatic origin (P3-24).
- The en and ko `SPECIFICATION.md` and `settle/DETAIL.md` each add one sentence. It matches the union clause of rule 6 in the stage contract.

**3. The Delta 3 P3 items are applied.**

| Item | Status |
|---|---|
| P3-18 red logs | `input-merge-red.log.gz` shows the input merge at 0 calls and the batched merge at 1 call. `red-provenance.json` names base `31ff8741c`, test bytes from `00ed5f3aa`, exit 1, 2 failed and 5 passed. |
| P3-19 `78b467b88` note | `b12-pr-body.md:15`, word for word. |
| P3-20 B8 README | `tools/b8/README.md:5,44,69` are updated and the sentence is appended, word for word. |
| P3-21 quiet-clock import | `observeQuietProcess.mjs:1` imports `../../waitForQuietProcess.mjs`, which exports `waitForQuietProcess` at `:12`. |
| P3-22 SHA updates | `b12-pr-body.md:5` and `b12-results.md:3` name `7af6a5d3c`. `b12-results.md:70` lists commits through `ea2bef3e1` but leaves out `7af6a5d3c` (P3-25). |

**4. The results document.** It was written at 05:59 KST, before window 3. It records:
- window 1 as candidate-invalid (`:52,60`);
- window 2 as an environment abort, with mds PID 394 at 57.85%, 120001.996 ms waited and partial raw kept (`:52`);
- the device fixes (`:54,79`);
- the final gates on `7af6a5d3c` (`:20-34`). `raw/b12/gates/counts.json` names `7af6a5d3caab…` and every exit code there is 0;
- the corpus at 79 scenes and 429 points with 0 difference, plus 7 new scenes and 21 points, and mount at 6 and 12 (`:13,42,85`);
- the declarations at 94 → 97 (`:38,85`);
- isolation and first write at 2 files and 10 tests (`:32,85`).

It also marks window 3 pending (`:3,54`). That line is now stale (P2-5).

**5. Hygiene is clean.**
- All three commits are authored and committed by Vincent Kelvin with the noreply address. They are subject-only, like all 21 branch commits, with no co-author, session or sign-off line.
- The added lines contain no `/Users/`, `/private/`, `claude-501` or session text. `b12-results.md` has none either.
- Of 71 compressed raw files, two keep `<tmp>/claude-501/perf-runs/…` after `/private/tmp` was replaced: `review-fixes/input-path-red.log.gz` and `window-3-device-failure/records.json.gz`. Committed B0 to B2 records already carry that segment, so this is not a new class.
- The PR body has no machine-local path. Its one path, at `:9`, is relative to the repository.

### New findings

**P2-5. The formal B12 window fails at its first measured step on a `.noindex` root (confirmed by the recorded failure and by reading the check).**
- Where: `design-optimization/tools/helpers/readConfig.mjs:55-62` at `7af6a5d3c`. The run-dir pattern ends in `-[a-zA-Z0-9-]+(?:\/(?:pair|stages))?$`. It allows no `.`, so it rejects `<run>.noindex/pair` and `<run>-stage-<lane>.noindex/stages`.
- Callers on the B12 path:
  - `tools/b11/window.mjs:135-151` runs `alternate.mjs` with `--run-dir=<root>/pair`, and `readAlternatingConfig.mjs:28` calls `readConfig`.
  - The stage steps at `tools/b11/window.mjs:166-207` pass `getStageRoot(root, lane) + '/stages'` to `tools/b4-2/stages.mjs`, which also calls `readConfig` (`:13-36`).
  - `tools/b12/window.mjs:4-6` and `tools/b12/prepare.mjs:7` require a `.noindex` root. So every B12 formal window hits this check.
- What happened:
  - Window 3 wrote `formal-start.json` at UTC 21:02:27.340 on `7af6a5d3c`.
  - `alternate` exited 1 at 21:02:30. The prepared root `20261028T2050-7af6a5d-b12-final.noindex/alternate.stderr.log` shows the `Use <YYYYMMDD>T<HHMM>-<commit7>-<label>` error thrown at `readConfig.mjs:60`.
  - `raw/b12/window-3-device-failure/failure.json` classifies it `device-path-validation-failure`, with 0 comparison processes, not retried.
  - The marker is opened with `wx`, so that prepared root cannot run another formal window.
- Why it slipped: the untimed smoke and `verifyInputs` never call `readConfig`. The Delta 3 device check covered the prepared paths and `getStageRoot` but missed this shared reader.
- No product data is lost, and this is not a product defect.

**P3-23. The doc comment of `readExplicitWriteKind` no longer states what it does (confirmed).** `readExplicitWriteKind.ts:12` says "Read the last caller origin covering one explicit input position". The function now returns whole coverage from any batch scope before it looks for the last origin. `@param context` (`:13`) does not mention `replacePaths`.

**P3-24. A later automatic write at the same position no longer hides an earlier caller whole write in the same batch (plausible relevance; confirmed by trace; untested).**
- Take a batch with `x.setValue('a')`, then an automatic origin at `/group/x` that `dispatchFinishInput.ts:36-42` records while the batch is marking, then the exit.
- On `00ed5f3aa` the latest covering origin was automatic, so the resolver ran. On HEAD, `replacePaths` holds `/group/x` from the caller write, so the resolver is skipped.
- This follows the union wording of rule 6, and the automatic write itself is still not counted. But no test or sentence pins it. A batch that marks a finish-input write is rare.

**P3-25. The PR body and the results commit list lag the final head (confirmed).**
- `b12-pr-body.md:3` does not state the batch-union rule. Every branch commit is subject-only, and repository CLAUDE.md item 6 makes the commit message the durable record, so the squash message needs that rule.
- `b12-pr-body.md:7` names only the first window. It omits window 2's environment abort and window 3's device failure.
- `b12-results.md:70` leaves out `7af6a5d3c`.

### Fix spec

1. **P2-5.** In `design-optimization/tools/helpers/readConfig.mjs`, accept an optional `.noindex` only directly before the optional `/pair` or `/stages` suffix, or at the end. Use either form:
   - Pattern: `/^\/private\/tmp\/claude-501\/perf-runs\/\d{8}T\d{4}-[a-f0-9]{7}-[a-zA-Z0-9-]+(?:\.noindex)?(?:\/(?:pair|stages))?$/`.
   - Or test `runDir.replace(/\.noindex(?=\/(?:pair|stages)$|$)/, '')` against the unchanged pattern. The uncommitted worktree edit at `:57` does this.
   - Keep `runId: path.basename(runDir)` unchanged.
   - Verify read-only, with no formal marker. From a scratch script outside the repository, call `readConfig([arg, '--samples=5', '--warmups=1'], pathToFileURL('<repo>/packages/canard/schema-form/architecture/verification/design-optimization/tools/'))` for each argument below:
     - `--run-dir=<new root>/pair` and `--run-dir=<getStageRoot(root, lane)>/stages` for lanes A and B must return.
     - A legacy root without `.noindex` must return.
     - `…-label.noindex.noindex/pair` and `…-label.noindex-x/pair` must throw.
   - Then `node tools/b4-2/checkTools.mjs`, `node tools/window/checkQuietProcess.mjs` and the B12 untimed smoke must stay green.
   - Optional, and the coordinator's decision: add the same read-only `readConfig` calls to the B12 smoke, so that a path rejection fails before `formal-start.json` is written.
2. **Results document.** Add this paragraph to the measurement-window section of `b12-results.md`: "세 번째 창은 `7af6a5d3c`로 UTC 21:02:27.340에 시작했으나 3초 뒤 alternate 단계에서 공용 readConfig가 .noindex 실행 경로를 거부해 종료값 1로 중단됐습니다. 비교 프로세스는 0개이며 재시도하지 않았고 정식 마커는 소진됐습니다. 장치 경로 검증 실패로 분류했으며 [장치 실패 원시](raw/b12/window-3-device-failure/)에 보존합니다." Change `:3` and `:54` to say the next window waits for the device fix and a new approval.
3. **P3-23.** Change `readExplicitWriteKind.ts:12` to "Read caller coverage at one explicit input position: a whole batch scope first, then the last covering origin." Change `:13` to "@param context - Batch replace paths and call-ordered origins, or a single caller write".
4. **P3-24 (decision for the coordinator).** Either append to the `settle/DETAIL.md` bullet "뒤의 자동 파생 쓰기도 앞선 호출자 whole 덮임을 거두지 않습니다." with the same clause in both `SPECIFICATION.md` files, or record it as a follow-up in `b12-results.md`.
5. **P3-25.**
   - Append to `b12-pr-body.md:3`: "같은 배치에서 whole로 쓴 서브트리는 뒤의 빈 merge나 부분 merge가 덮임을 거두지 않습니다."
   - Extend `:7` with window 2's environment abort and window 3's device failure.
   - Append `` `7af6a5d3c`(배치 덮임 합집합) `` and the P2-5 commit to `b12-results.md:70`.

### Unverified (delta 4)

- No test, typecheck, build, lint or device check was run. The product conclusions rest on the trace and the saved red and green logs.
- An uncommitted change to 16 tools files was in progress in the worktree during this review and is not reviewed here. Besides `readConfig.mjs` and `profile/context.mjs`, it touches prepare, window, summarize and checkTools under B4-1, B4-2, B6, B8 and B11. That reaches past the B11 and B12 path into legacy devices, so it needs its own delta review.
- The steps after `alternate` (stages, heap, retention, summary) were checked for `.noindex` only by searching for path patterns. Apart from `readConfig`, no other check was found on the B11 path. `profile/context.mjs` is not called by the B11 window.
- P3-24 was not executed.

## Delta 5 — `7af6a5d3c..652ddf6ee`

Reviewed head: `652ddf6ee`. HEAD did not move during this review. Static review only: git, grep, file reads, and reads of the prepared roots under `perf-runs`. No build, test, typecheck, lint, syntax check or device run was started, because window 4 is running on this machine. Path conventions follow Delta 4.

Commits in the range. There are two.
- `6d178eef8` test(schema-form): accept noindex roots throughout the window CLI. It changes 18 tools files and adds `tools/window/preflight.mjs`.
- `652ddf6ee` test(schema-form): pin caller coverage across automatic writes. It changes the coverage TSDoc, one test file, `settle/DETAIL.md` and both `SPECIFICATION.md` files.

**Verdict for `652ddf6ee` (delta 5): CONDITIONAL PASS — P1 0 / P2 0 / P3 4.** P2-5 is resolved. Window 4 has already passed the step that stopped window 3. The range has no product runtime change. Merge still needs two conditions:
- Window 4 completes and passes. Then `b12-results.md:3`, `:54` and `b12-pr-body.md:7` record its result instead of "pending". Window 4 started on the prepared root `20261028T2118-652ddf6-b12-final.noindex` at UTC 2026-10-28 21:25:04.718, with A at `4d0fa4a12` and B at `652ddf6ee` (`inputs.json`).
- `b12-results.md` and `raw/b12/` are committed with the PR. They are still untracked.

### Requested checks

**1. P2-5 is resolved (confirmed by reading and by the running window).**

| Validator at `652ddf6ee` | `.noindex` accepted | Other suffixes | Legacy names |
|---|---|---|---|
| `design-optimization/tools/helpers/readConfig.mjs:55-62`, shared by `alternate` and every stage run | `:57` strips one `.noindex` placed just before `/pair` or `/stages`, or at the end. `<run>.noindex/pair`, `<run>.noindex/stages`, `<run>-stage-a.noindex/stages` and `<run>.noindex` pass. | `.noindex.noindex/pair` is rejected: only the second suffix is stripped, and the `.` left behind is outside `[a-zA-Z0-9-]`. `.noindex-x/pair` and `.foo/pair` are rejected. A suffix after the segment is wrongly accepted (P3-26). | Unchanged |
| `design-optimization/tools/profile/context.mjs:11-19` (`D0_RUN_DIR`) | At the end only (`:14`) | Rejected | Unchanged |
| `design-optimization/tools/profile/branch-switch/runWindow.mjs:9-15` (B0 root) | At the end only (`:12`) | Rejected | Unchanged |
| `tools/b4-1/prepare.mjs:46-49`, `tools/b4-2/prepare.mjs:46-49`, `tools/b6/prepare.mjs:68-71`, `tools/b8/prepare.mjs:70-73`, `tools/b11/prepare.mjs:72-75` | At the end only | Rejected. B11 is equivalent to its old inline `(?:\.noindex)?$`. | Unchanged |
| `tools/b12/prepare.mjs:7`, `tools/b12/window.mjs:4-7`, `tools/window/preflight.mjs:15` | Required | Not a shape check | Not applicable |

- The validators are consistent. Each one accepts at most one `.noindex` on the root segment and leaves legacy names byte for byte. The one gap is the readConfig over-acceptance in P3-26.
- Every stage path in tools now comes from `tools/window/getStageRoot.mjs:7-12`. A search for `-stage-` and `stages/` finds no string-built stage root left.
- Steps after `alternate` on the B11 and B12 path:
  - `tools/b4-2/stages.mjs:36-39` calls `readConfig`, which now accepts the stage root.
  - `stages.mjs:50-53` needs `scratch/instrumentation.json`, which exists in both stage roots of the new prepared root.
  - The heap runs take no root. `retention.mjs` takes plain paths with no shape check. `b11/summarizeSelf.mjs:26` uses `getStageRoot`. `b8/quietWorkerPreload.mjs` has no path check.
- **Live evidence.** Window 4 wrote `formal-start.json` at 21:25:04.718. Its `alternate.stderr.log` is empty. At the time of reading, `alternate.log` showed four `ALTERNATING_ROW_OK … processes=20` rows. Window 3 died at this exact step.
- **The rehearsal.** `tools/window/preflight.mjs` does the following:
  - It calls `readAlternatingConfig` with the `.noindex/pair` path (`:33`) and with the legacy `/pair` path (`:34`), and requires the doubled suffix to throw (`:35-37`).
  - It calls `readConfig` for both stage roots (`:38-47`) and loads `context.mjs` with the prepared root (`:48-53`).
  - It asserts that no formal marker exists before or after (`:16`, `:96-97`).
  - The saved run is in `raw/b12/device/actual-cli-preflight/` and `final-preflight.log.gz`.

**2. The legacy device edits only change paths (confirmed by reading every hunk).**
- The edited files are B4-1 (`prepare`, `summarize`, `verifyInputs`, `window`), B4-2 (`prepare`, `summarize`, `window`, `checkTools`), B6 (`prepare`, `window`, `checkTools`) and B8 (`prepare`, `window`). Each file makes only these three changes:
  - It imports `getStageRoot`.
  - It replaces `root + '-stage-' + lane.toLowerCase()` and `root + '-stage-b'` with `getStageRoot(root, lane)` and `getStageRoot(root, 'B')`.
  - It strips one trailing `.noindex` before the prepare-root match.
- For a root without `.noindex`, `getStageRoot` returns `root + '-stage-' + lane.toLowerCase()`, which is the old string. Every legacy address is therefore unchanged.
- The range changes none of these: sample counts, warm-ups, process counts, row lists, quality mode, CPU thresholds, intervals or wait budgets. The Spotlight 600 s rule is not touched here; it landed earlier in `bd7fd658b` and `85b687d83`.
- The legacy synthetic checks still reference files that exist. `tools/b4-2/checkTools.mjs` reaches `buildStages`, `recorder`, `summarize`, `window` and `verifyInputs` in `tools/b4-2/`. `tools/b6/checkTools.mjs` reaches `../b4-2/buildStages.mjs`, `./buildStages.mjs`, `summarize` and `window`. All of these exist at `652ddf6ee`, as does `tools/window/getStageRoot.mjs`. B6 uses a `mkdtemp` root without `.noindex`, so it still exercises the legacy form. Their saved green runs predate the commit (P3-27).

**3. No product runtime change (confirmed).**
- `src/**` has three edits. `readExplicitWriteKind.ts:12-13` changes only the TSDoc, with no code token. The test file and `settle/DETAIL.md` are not shipped code.
- No `package.json`, `vite.config`, `tsconfig`, rollup config or lockfile changed.
- The shipped bytes did not change. Lane B `index.node.mjs` is 823431 bytes with sha256 `b89a99e111524f7b…` in both the `7af6a5d` prepared root and the `652ddf6` prepared root. `raw/b12/gates/counts.json` records the same hash for `652ddf6ee`.
- This is not a P1.

**4. The Delta 4 P3 items are applied.**

| Item | Status |
|---|---|
| P3-23 TSDoc | `readExplicitWriteKind.ts:12-13` match the fix spec word for word. They describe the code: a single write returns `context.kind` (`:21-22`), the batch-scope check follows (`:24-29`), then the latest covering origin (`:30-49`). |
| P3-24 | The coordinator took the documentation sentence plus a test. `settle/DETAIL.md:9`, en `SPECIFICATION.md:643` and ko `SPECIFICATION.md:641` each add one sentence. |
| P3-25 | `b12-pr-body.md:17` states the batch union rule and the automatic-write clause. It gives window 2 as an environment abort with mds over the 120 s budget, and window 3 as the readConfig `.noindex` rejection with 0 comparison processes. `b12-results.md:70` lists `7af6a5d3c`, `6d178eef8` and `652ddf6ee`. |

**The automatic-write union test is load-bearing (confirmed by trace; not executed).**
- The test at `settle.inactive-value.explicit.test.ts:14-43` batches three writes: `x.setValue(' caller ')`, `dispatchFinishInput(x)`, and `open` false.
- Inside a batch, `dispatchFinishInput.ts:30-42` reads the marked ` caller `. `finishStringInput` trims it because `options.trim` is true, and the call pushes a write with `source: 'automatic'`.
- `flushBatchWrites.ts:40-56` records the origins `/group/x` callerReplace, `/group/x` automatic, `/open` callerReplace. `collectReplacePaths.ts:18-26` skips the automatic origin, so `replacePaths` is `['/group/x', '/open']`.
- On HEAD, `readExplicitWriteKind.ts:24-29` returns `callerReplace` at `/group/x`. `hasExplicitInactiveValue.ts:33-44` returns true, and the resolver is skipped.
- Without the scope check, as on `00ed5f3aa`, the loop meets the automatic origin first and returns `automatic` (`:43`). The function returns false and the resolver runs once, so `:40` fails. Re-entry would then read `resolved`, so `:42` fails too.
- `:42` also proves that the automatic write happened. Without that write, the retained value would be ` caller ` with its spaces. So the test cannot pass vacuously.
- `raw/b12/gates/unit.log.gz` and `verify.log.gz` list the file with 9 tests green on the final head.

**5. The results document.** I read it after it was written at 06:23 KST, which is before window 4 started.
- It records window 1 as candidate-invalid (`:52`, `:60`).
- It records window 2 as an environment abort: mds PID 394 at 57.85%, after 120001.996 ms (`:52`).
- It records window 3 as a device failure (`:87`): readConfig rejected the path at `alternate`, exit 1, 0 comparison processes, and the marker is spent. This is the paragraph from the Delta 4 fix spec.
- It records the final gates on `652ddf6ee` (`:3`, `:20-34`). `counts.json` names `652ddf6eede1…`, and every exit code is 0. The build started at UTC 21:17:00.376, one second after the commit.
- It records the actual-CLI rehearsal (`:89`): 1 row, 1 process, warm-up 1, sample 1, exit 0, no formal marker, and not an adopted number. `raw/b12/device/actual-cli-preflight/summary.json.gz` holds `formal: false`, 1 worker, 1 warm-up, 1 sample, status 0 and `formalMarkerCreated: false`.
- It marks window 4 as pending (`:3`, `:54`). That became stale when window 4 started at 21:25 UTC (see the merge conditions).

**6. Hygiene is clean.**
- Both commits are authored and committed by Vincent Kelvin with the noreply address. They carry only a subject line, with no co-author, session or sign-off line.
- The added lines contain no `/Users/`, `/private/`, `claude-501`, session or personal-name text. The `/private/tmp/claude-501/perf-runs` regex literals in readConfig, context and runWindow already existed before this range. Only the `.replace(...)` argument changed.
- `b12-pr-body.md` and `b12-results.md` contain no machine-local path, no session link and no personal name.
- Of the raw files written since Delta 4, only `device/actual-cli-preflight/command.json.gz` keeps `<tmp>/claude-501/perf-runs/…`. That is the same class as the two files Delta 4 listed.

### New findings

**P3-26. readConfig also strips a `.noindex` that comes after the `/pair` or `/stages` segment (confirmed by tracing the regex; not executed).**
- Where: `design-optimization/tools/helpers/readConfig.mjs:57`. The lookahead `(?=\/(?:pair|stages)$|$)` also matches a `.noindex` at the very end, after the segment.
- Effect: `<run>/pair.noindex`, `<run>/stages.noindex` and `<run>-stage-a/stages.noindex` pass the check, and the tool would write to them.
- No caller builds such a path, so no window can fail or misplace data through it today. `b11/window.mjs` passes `path.join(root, 'pair')` and `getStageRoot(root, lane) + '/stages'`. The code is looser than the suffix rule stated in Delta 4.

**P3-27. The saved green runs of the legacy synthetic checks predate `6d178eef8` (confirmed by file times).**
- `raw/b12/review-fixes/device-legacy-green.log.gz` (`B4_2_TOOL_SMOKE_OK`) is from 05:59 KST. `device-summary-green.log.gz` (`B6_TOOL_SMOKE_OK`) is from 05:41 KST. The commit is from 06:12:40 KST, and it edits both `checkTools.mjs` files.
- No run after the commit is saved for `tools/b4-2/checkTools.mjs`, `tools/b6/checkTools.mjs` or `tools/window/checkQuietProcess.mjs`.
- B4-1 has no synthetic check. `tools/b8/checkWindowTools.mjs` does not reach the edited stage paths. So the B4-1 and B8 edits are verified by reading alone.
- By reading, the edits are sound and keep legacy paths byte-identical, so the risk is low. A syntax or import slip would surface only when someone reruns a legacy device.

**P3-28. The new automatic-write test has no saved red run (confirmed).** Earlier fixes saved a red run on the base without the fix (`batch-union-red.log.gz`, `red-provenance.json`). This test pins behaviour that `7af6a5d3c` already introduced, so it is green on both `7af6a5d3c` and `652ddf6ee`. `b12-results.md:89` calls it a regression test, but that claim rests only on the trace above.

**P3-29. The rehearsal CLI is undocumented, and its rejection check accepts any error (confirmed).**
- Neither `tools/window/README.md` nor `tools/b12/README.md` names `preflight.mjs`. They also do not give its argument (a prepared `.noindex` root without a marker) or say that it runs before the formal window. `b12-results.md:89` describes the run but not the command.
- `preflight.mjs:35-37` calls `assert.throws` without a matcher, so any throw passes. It tests only the doubled suffix. It does not test `.noindex-x` or the misplaced suffix from P3-26.

### Fix spec (all optional; none blocks merge; apply nothing to tools while window 4 runs)

1. **P3-26.** Record this sentence under `후속 범위` in `b12-results.md`: "P3-26: 공용 readConfig는 /pair·/stages 뒤의 .noindex도 받아들입니다. 이 경로를 만드는 호출자는 없으며 규칙을 좁히는 수정은 후속으로 남깁니다." If the coordinator prefers a code fix after window 4 ends, make this change in `design-optimization/tools/helpers/readConfig.mjs:55-58`. Test the raw `runDir` against `/^\/private\/tmp\/claude-501\/perf-runs\/\d{8}T\d{4}-[a-f0-9]{7}-[a-zA-Z0-9-]+(?:\.noindex)?(?:\/(?:pair|stages))?$/`, drop the `.replace(...)` call, and keep `runId: path.basename(runDir)`. To verify, run read-only `readConfig` calls. These must return: `<run>/pair`, `<run>.noindex/pair` and `<run>-stage-a.noindex/stages`. These must throw: `<run>/pair.noindex` and `<run>.noindex.noindex/pair`. Then run the rehearsal on a new root.
2. **P3-27.** After window 4 ends, run these on `652ddf6ee` with Node 26 and the same arguments as the saved green runs: `node tools/b4-2/checkTools.mjs`, `node tools/b6/checkTools.mjs` and `node tools/window/checkQuietProcess.mjs`. Save the logs as `raw/b12/review-fixes/device-legacy-green-6d178ef.log.gz`, `device-summary-green-6d178ef.log.gz` and `device-green-6d178ef.log.gz`. Each must print its existing OK line.
3. **P3-28.** Either save a red run, or append this sentence to `b12-results.md:89`: "자동 쓰기 합집합 시험은 7af6a5d3c의 동작을 고정하는 시험이며 실패 재현 없이 추적으로 확인했습니다." For a red run, use a scratch worktree at `652ddf6ee` with `readExplicitWriteKind.ts` taken from `00ed5f3aa`. Run only this test, and expect "called 1 times". Save the log as `raw/b12/review-fixes/automatic-union-red.log.gz` and add its provenance to `red-provenance.json`.
4. **P3-29.** Append this sentence to `tools/window/README.md`: "`preflight.mjs <준비된 .noindex 루트>`는 정식 마커가 없는 준비 루트에서 정식 창 전에 실행하는 비정식 예행입니다. 별도 `-preflight.noindex` 디렉터리에서 실제 alternate CLI를 1행·1프로세스·예열1·표본1로 실행하고 공용 readConfig와 profile context의 .noindex 경로를 검사합니다." In `preflight.mjs:35-37`, pass the matcher `/perf-runs\/<YYYYMMDD>T<HHMM>/` as the second argument of `assert.throws`.

### Unverified (delta 5)

- No test, typecheck, build, lint, syntax check or device run was started. The tool conclusions rest on reading. The product conclusion rests on the trace, the saved gate logs and the bundle hashes.
- No file I read records whether the coordinator approved window 4.
- Window 4 was still running during this review, and only its first four `alternate` rows had finished. The stage, heap, retention and summary steps on `.noindex` stage roots are verified by reading and by the rehearsal's in-process `readConfig` calls, not by a finished run.
- I did not compare the unit total of 3,949 with the `7af6a5d3c` gates, because those counts were overwritten. The log lists the explicit file with 9 tests.
- The P3-26 regex behaviour was traced by hand, not executed.
