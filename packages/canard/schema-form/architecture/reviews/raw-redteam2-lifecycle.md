# Red team round 2 — work loop (W1–W5), dispatcher (W6), terminal strategy (W7)

Method: current tree driven with `vite-node`; React 19.2.6 + jsdom under `vitest`, out-of-tree root. RAN = executed here; REASONED = traced against records/code.

## 1. Round-1 findings: closed / not closed

- **R6** (guard cycles, post-cap state) — *closed in the tree, reopened at the React boundary*: `0007:31,52` defines discard + sync throw; N1 shows that throw is uncatchable and leaves the DOM ahead of the tree. Cap value open (`0007:73`).
- **R7** (several fixed points) — *not closed, relabeled*: `0007:55` claims user data is not destroyed — true of the tree, false of the emitted document, where the losing sibling is silently absent from `getValue()`/submit. That was R7's harm.
- **R8** (destructive pruning) — *closed*: `0006:24`, `0007:43` — deactivation is exclusion from emission.
- **R12** (null contract > value tree) — *not closed*: `0006:48`, Q2; N2 shows the gap exceeds write-intent.
- **R13** (array identity ledger) — *not closed*: `0006:50`, `0011:50`.
- **R14** (lazy nodes) — *closed for handle nodes, reintroduced by `0011:49`*: with N7's aliasing, `/items/5` resolves to `/items` before materialization.
- **R15** (non-value entrances, `RequestRefresh`, schema-change event) and **R16** (`VirtualNode`) — *not closed*: `0007:67-69`, Q5.
- **R17** (root dispatcher) — *spec closed*, six items at `0008:51-56`. New gap: N9.

## 2. New findings (ranked)

**N1 — W3/W5 · REACT-HAZARD + CORRECTNESS · RAN.** Cap throw inside `onChange`, uncontrolled input, boundary above the field: `ok write: DOM="ab" committed="ab"` → `capped write: DOM="ab!" committed="ab" sync=2 fallback=false`. The error boundary does **not** catch it (event-handler errors never do); `onUncaughtError`/`onCaughtError` are render-phase only; the throw never reaches the dispatch caller — it lands as a global uncaught error. The state update issued before the write still commits (`sync` 1→2). In production the user sees the typed character, the tree holds the old value, nothing is red, the form keeps working. The only repair channel is `RequestRefresh`, which `0007:68` excludes for the originating node. A batch is worse — write #7 of 10 discards 1–6 whose DOM already moved. *Fix:* commit the pending raw, mark the subtree `unsettled`, send `RequestRefresh` **to the originating node too**, surface it as a form-level error, throw only in dev.

**N2 — W2 · UNEXPRESSIBLE-REQUIREMENT · RAN.** "Nodes under a null ancestor keep their raw" contradicts the null contract. After typing `note='typed'`, `keep='K1'`, `setValue(null)` on the parent: `note.value="D"` (schema default), `keep.value=undefined` — S4's blank form — and a later write emits `{"target":{"note":"Z"}}`; `K1` does not return (`ObjectNode/DETAIL.md:19`). Under W2 it would. `resetSubtree()` then yields `{"note":"INIT","keep":"K0"}` — a third value, the frozen initial (`AbstractNode/DETAIL.md:13,65-67`). One raw slot cannot hold three. Deactivate→reactivate (RAN): current restores `a:"A"`, W2/`0006:43` restores `a:"user"` — deliberate, but it also flips the `default-after-null` criterion that requires blank after a null passage. *Fix:* §3; decide per slot, or amend `AbstractNode/DETAIL.md`.

**N3 — W1/W4 · CORRECTNESS · RAN.** "A node's memo is the same reference as the corresponding part of the snapshot" is false wherever refinement exists. `omitTrailing`: `arr.value = ["a",null,null]` (3 children) while the parent holds `["a"]`, and `root.value.arr !== arr.value`. `omitEmpty`: `obj.value = {}` and the snapshot has **no `obj` key** — no corresponding part exists. `node.value` and the `UpdateValue` payload are contractually raw (`AbstractNode/DETAIL.md:8`, criterion `:77`), so a refining branch node needs two memos, or `node.value` recomputes — which W4 forbids.

**N4 — W3 · NON-CONVERGENCE/PERF · REASONED.** `begin` is top-down, `complete` bottom-up, so pass 1's guards read the **previous commit's** emission. Discriminator `a→b`: pass 1 keeps branch `a` active and emits the impossible `{kind:'b', x:'X'}`; pass 2 flips the branch and injects `y`'s default; pass 3 confirms. Three passes for any guard-relevant write, ~`2·depth+1` for a nested union. Also: `&` expressions and `injectTo` run in `complete` (`0007:29,72`), executing against transient emissions that are then discarded; and within one `complete`, an `&` expression reading a later sibling reads pass N−1 — order-dependent, costing another pass.

**N5 — W1/W3 · PERF-REGRESSION · RAN.** Keystroke on a leaf inside a 10,000-item array, current implementation: **0.70–1.71 µs/write**, unchanged when `root.value` is forced each iteration (1.28 µs) — the snapshot is immutable (old snapshot preserved, untouched items keep identity) yet the O(n) rebuild is not paid per write. The redesign's floor is one array rebuild per level **per pass**: 1.91 µs native copy, **11.10 µs** element-wise — and filtering (`omitEmpty`/`omitTrailing`/active set, `0007:28`) forbids the native copy. With N4's three passes: 5.7–33 µs, **3–20×** current, on the shape the package exists for. *Fix:* skip refinement in `complete` when the active set and child memos are unchanged; restrict repeat passes to the subtree that flipped.

**N6 — W3 · CORRECTNESS · REASONED.** "Passes over dirty subtrees only" is unsound with a hoisted guard. A root guard reading `/a/b/c` is found by the reverse index (`0006:35`) and may activate `/x/y`, a subtree with no dirty mark. `begin` must descend into it and `complete` must climb from it to the root, so the dirty set has to grow during the pass (newly activated nodes ∪ their spines). As written the new subtree is skipped and its default injection lands a pass late or not at all.

**N7 — W7 · CORRECTNESS · RAN.** `findNode.ts:86` returns the terminal node for any deeper path: `find('/payload/amount') → /payload`; `find('/payload/no/such/path') → /payload`. Writing through the alias — `setValue(42)` on what the consumer believes is one field — left the document as `{}`: object destroyed, key gone, no error. W7 widens the trigger from `isReactComponent` (`getNodeGroup.ts:27-29`) to "present and non-null", so `React.lazy` results, `{default: Comp}` namespaces and config objects now collapse a subtree; `0011:49`'s lazy array extends the aliasing to `/items/5`. *Fix:* `findNode` returns `null` when segments remain and the cursor is terminal, plus a dev warning naming the terminal owner.

**N8 — W7 · COMPLEXITY-MOVED · REASONED.** `0011:40` justifies "present and non-null" with "the same rule applies to overlay-injected components (ADR 0012)" — but 0012 withdrew the overlay. The surviving channel, `formTypeInputMap`, resolves in the render layer after the tree is built, so one component terminalizes inline and does not when path-mapped. The dev warning (`0011:42`) covers only the inline direction.

**N9 — W6 · REACT-HAZARD · REASONED.** "Re-entrant writes commit immediately, notify next wave" makes `{previous, current}` stop describing the tree: two listeners on one node in one wave disagree — the second reads `node.value` (wave N+1 state, a W4 field read) holding a wave-N payload. `0008:65` asks about intermediate payloads, not about this.

## 3. The minimal extra state the null contract forces onto nodes

Per node, on the node (no side table):

1. **raw** — editing value incl. `''` and remembered valueless writes. *One slot suffices* (RAN: clearing `note` while null, then writing a sibling, emits `{"keep":"K2"}`).
2. **restoreValue** — what branch restore / re-activation returns to; replaced by blank on a null passage (`AbstractNode/DETAIL.md:13`).
3. **initialValue** — frozen at construction; the public `defaultValue` and the target of `resetSubtree()` (RAN: `INIT`/`K0` returned after a null round trip).
4. **nullness** — on nullable branch nodes, distinct from "no raw": `null` ≠ `{}` ≠ absent (S1, S3).
5. **intendedWriteSinceLastInjection** (1 bit) — S6's equal-value write and `injectTo` inheriting its cause (`AbstractNode/DETAIL.md:15`); phase alone is insufficient (R12).
6. **blankedByNullAncestor** (1 bit) — which subtrees lost their restore value, so a later restore yields blank, not initial.

## 4. Survived

- **Terminal-object validation.** Expected orphaned errors; the interior error arrives whole at the terminal node — `payload.errors = ["/payload/amount:minimum"]`, identical to raw AJV output, `root.errors = []`. `0011:44` holds. Residual cost is legibility: a terminal `oneOf` degrades to one `must match exactly one schema in oneOf` per widget.
- **S2's remembered valueless write** — expressible with one raw slot (§3.1).
- **Dispatcher item 3** (bump X's revision immediately before its listeners), attacked with a mid-wave `flushSync`: every render sees committed memos, so a not-yet-notified node renders consistently and re-renders on its bump.
- **W1's memo** fixes a real defect: today `arr.normalizedValue !== arr.normalizedValue` across two reads, violating "same value read twice, same reference".

## 5. Still unasked

- What `node.value` returns between MARK and COMMIT for a terminal node with pending raw, and inside a batch.
- Whether root `onChange`/validation fire when a cap trips mid-batch, and whether the stale verdict still answers `isValid`.
- Whether `find()` gets an index: `find('items/4321')` on a 10k array costs **30.75 µs** (RAN), a linear scan per segment on the read path W4 calls free.
- Memory and purge policy (Q1) for raw retained on every inactive branch of a 10k array.
- Whether `injectTo` can run in `complete` without making compute effectful, and what becomes of its writes when the pass is discarded.
