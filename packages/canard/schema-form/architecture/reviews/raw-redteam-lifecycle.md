# Red team — value ownership & lifecycle (ADR 0006/0007/0008/0009/0011)

"Measured" = probe run via `vite-node` against `src/` at `ef598554e`. Paths relative to `packages/canard/schema-form/`.

## F1 — The null contract needs a second value store; L1 makes it unrepresentable
**L1, L4. CORRECTNESS / UNEXPRESSIBLE-REQUIREMENT.**

`{target:{type:['object','null'],properties:{note:{default:'D'},deep:{…},list:{minItems:2}}}}`, `defaultValue:{target:null}`.
Measured: `root.value={"target":null}` while `target/note='D'`, `target/deep={"x":"X"}`, `target/list=[null,null]`. `note.setValue('')` while null leaves `root.value` unchanged and `note.value=''`. A later write to `deep/x` materializes `{"deep":{"x":"typed"},"list":[null,null]}` — **`note` absent, default not restored**.

S4+S5 and "값 없는 쓰기는 기억되어 이후 객체가 될 때 반영됩니다" (`ObjectNode/DETAIL.md:15,19`) thus require a live, writable subtree at a path absent from the emitted tree. Under L1 `root.value.target===null`, so `/target/note` has nothing to read and nowhere to write.

**Fix:** value tree of *slots* — a null branch slot carries `null` **and** a detached subtree; `root.value` is a projection stopping at null slots. ADR 0006 must name that second store.

## F2 — Phase-based provenance cannot express S6
**Q2, L1, L2, L5. UNEXPRESSIBLE-REQUIREMENT.**

`Replace` = "a value equal to the current one is still applied" (`core/types/value.ts:28-29`); `Overwrite = Replace|Merge` (`:65`); the equality early-return is skipped when `Replace` is set (`StringNode.ts:51-52`).
Measured: source already shows `'seed'`; `source.setValue('seed')` turns `target` from `null` into `{"note":"from:seed"}`.

Under L1 an equal write yields an **identical value tree**, so L5's "unchanged reference ⇒ skip" skips the settle — yet S6 demands an effect. Phase cannot separate "Write ran and changed nothing" from "no Write ran". Q2's premise holds for Reconcile/Derive only.

**Fix:** the settle carries a per-cycle set of *intentionally written paths*, recorded even for a no-op write; null-unlock and L5 both consult it — still a per-write provenance record.

## F3 — Reconcile's default injection admits schemas with no fixed point
**L2. NON-CONVERGENCE.**

`if:{not:{required:['p']}}, then:{properties:{p:{default:1}}}`: p absent → fragment on → Reconcile writes `p=1` → guard false → prune → guard true. AJV accepts the schema, so G1 holds while the form throws.
Measured on the nearest current analogue (`p:{default:1,computed:{active:'../p === undefined'}}`): settles to `{}`, `active=false` — reactivation restores the *restore value*, not the schema default. ADR 0007 step 3 swaps that for default injection, turning a terminating-but-lossy outcome into a hard error.
Measured on derived cycles (`a:'../b+1'`, `b:'../a+1'`): `INFINITE_LOOP_DETECTED` thrown **asynchronously, outside the caller's stack** (`EventCascadeManager.ts:97`) — `try/catch` missed it; the process died. A synchronous settle makes it catchable but leaves the tree mid-iteration, and ADR 0007 never states the post-cap state.

**Fix:** define the cap's failure state (roll back to the pre-Write tree, emit nothing, raise a form-level error); never inject a default into a node whose own absence is the guard's input.

## F4 — The fixed point is order-dependent and silently deletes user data
**L2, G5. CORRECTNESS.**

`a.active='../b === undefined'`, `b.active='../a === undefined'`, `defaultValue {a:'A',b:'B'}`.
Measured: declaration order `a,b` → `{"b":"B"}`; order `b,a` → `{"a":"A"}`. Two valid fixed points; one user value dies either way, with no error. ADR 0007 fixes only the vertical direction, so a legal form's settled value depends on `properties` key order, which JSON transport does not guarantee. G5's "같은 스키마와 같은 쓰기 순서는 같은 상태" is determinism, not uniqueness — the design reads it as uniqueness. Principle 3 sends `&active` and fragments down this same path.

**Fix:** define the result as the least fixed point over a declared total order (document order); dev-mode re-runs Resolve in reverse sibling order and reports divergence as an author error.

## F5 — Q3 has no free answer; both horns measured
**L1, L2, Q1, Q3. CORRECTNESS.**

Measured on an `omitTrailing` array: raw `["x","",null]`, normalized `["x"]`. AJV with `minItems:2`: raw → `/l/2 must be string`; normalized → `/l must NOT have fewer than 2 items` — the user sees three rows and is told there are fewer than two.
Guard horn, AJV, `required:['note']`: `true` on raw `{note:''}`, `false` on normalized `{}`. If guards read normalized, clearing a text field flips its fragment off **on that keystroke**, Q1 prunes that subtree, and one retyped character re-enables it and re-injects defaults — user input destroyed by a transient empty string. If guards read raw, the rendered shape disagrees with the verdict.

**Fix:** guards read raw, normalization confined to Commit; make deactivation non-destructive (mark inactive, exclude from the emitted projection) — that also closes F3 and most of F4.

## F6 — Array item identity is not a function of the value tree
**L1, L4. UNEXPRESSIBLE-REQUIREMENT / COMPLEXITY-MOVED.**

Identity is a creation-order nonce, `'#' + this.__revision__++` (`ArrayNode/strategies/BranchStrategy/BranchStrategy.ts:381`).
Measured: `remove(0)` preserves node objects and nonces (`#1,#2`) but shifts paths; `setValue(['b','c','d'])` destroys and recreates every item (`#3,#4,#5`) — `applyValue` is `clear()` + per-item `push()` (`:341-347`).
ADR 0011 §2 sources the array's child set from *the value* while calling identity *a key independent of the index*. A value array holds no such key and a bulk write carries none, so L1+L4 need an identity ledger mutated by structural ops — a second source of truth for array structure.
Compounding: the React cache key is `node.key + child.nonce` and `node.key` embeds the **path** (`AbstractNode.ts:212`, `useChildNodeComponents.tsx:64`), so remove-in-the-middle remounts every surviving item and never evicts the stale entries.

**Fix:** make the nonce the sole identity (drop path from the React key); define a bulk array write as a reconcile against the existing key list under a declared matching rule, never clear+push.

## F7 — Lazy nodes make `find()` a mutation and void the revision ledger's purpose
**L4, L3. REACT-HAZARD / COMPLEXITY-MOVED.**

`revision` is a per-node ledger (`EventCascadeManager.ts:164`) fed to `useSyncExternalStore` (`hooks/useSchemaNodeTracker.ts:45-49`) to detect deliveries missed across React's render→commit gap (`:10-19`). A node materialized *after* the event it missed starts at 0 — the invariant is void exactly where it was needed. `find('/path')` becomes side-effecting and is called during render (`SchemaNodeInput`, `Form.Render`), so StrictMode materializes twice. Validation routing, `injectTo` targets and `RequestFocus` all address unmaterialized paths.

**Fix:** move `revision`, errors, state and identity into a root-owned path-keyed side table; nodes become pure handles — ADR 0006 then owns **two** trees.

## F8 — Node state and `globalState` sit outside the settle cycle
**L2, L3. COMPLEXITY-MOVED-NOT-REMOVED.**

Measured: `a.setState({dirty:false})` leaves `root.globalState.dirty===true` — OR-accumulation, never lowered. L3 makes this a derived aggregate, but state changes are not writes: `Touched` is set from a `requestAnimationFrame` callback (`SchemaNodeInput.tsx:82-85`). ADR 0007's flowchart has no entry for them; ADR 0008 leaves `globalState` undecided. **Fix:** `SetState` enters at phase 1 beside Write, skips Resolve/Reconcile/Derive; Commit re-aggregates from per-flag counters.

## F9 — Caret preservation belongs to the write, not the settle
**L2, L3, Q6. REACT-HAZARD.**

`RequestRefresh` rides on the write option: typing omits `Refresh`, external `setValue` defaults to `Overwrite`, which includes it (`value.ts:63-65`; `useFormTypeInputControl.ts:20-23`; remount at `SchemaNodeInput.tsx:121` `key={version}`). Q6 shrinks the option word and ADR 0008 makes Notify one emission per settle — so a keystroke that also flips a fragment would remount the input being typed into. **Fix:** keep `Refresh` per-write, and exclude the originating node from Refresh in its own settle.

## F10 — `VirtualNode` does not fit L4's table
**L3, L4, Q5. COMPLEXITY-MOVED.**

`injectTo` fires from a subscription (`AbstractNode.ts:971-977`) and computed dependencies subscribe to each dependency's `UpdateValue` (`:530-535`) — both move into Derive cleanly. `VirtualNode` does not: `__value__` is an array over N **non-contiguous** paths, and refNodes are its children while remaining the parent's children (`VirtualNode.ts:118-136`). Under L1 its value has no path; under L4 its child set comes from neither schema nor value. Q5 must be answered **before** ADR 0011.

## Claims that survived

- **L1's copy cost.** Strongest attack: deep+wide eager spine rebuild per keystroke. Measured `{...1000-key}` = 0.0013 ms vs the whole current synchronous write path = 0.0010 ms; current upward propagation is already eager, not lazy (depth-9 × 60-sibling tree, deep leaf write with vs without reading `root.value` = 0.0019 vs 0.0015 ms/write). ADR 0006's "출발점은 같다" is correct.
- **L5's reference-based skip**, for guards over untouched subtrees — except where F2 requires a no-op write to act.
- **Derive's automatic provenance.** Phase expresses it exactly, including the asymmetry with `injectTo`: derived skips the write when the value is equal (`AbstractNode.ts:546`), which is why `ObjectNode/DETAIL.md` History rejected giving derived intended provenance.

## Questions the design has not asked itself

1. What is the form's state after the iteration cap trips — rolled back, mid-iteration, or emitted?
2. Is the fixed point unique, and what defines sibling order?
3. Who owns node state (dirty/touched/errors/selection-guard) once nodes may be lazy?
4. Does `RequestRefresh` belong to the write or to the settle?
5. `node.jsonSchema` becomes reactive (ADR 0005 결과) — which revision bit does React subscribe to? There is no `UpdateSchema` in `NodeEventType` (`core/types/event.ts:45-80`).
6. Is Notify synchronous? ADR 0008 leaves it open while ADR 0007 already places Commit inside the synchronous region.
