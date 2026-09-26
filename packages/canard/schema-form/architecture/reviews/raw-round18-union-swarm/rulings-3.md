# Rulings round 3 — owner decisions O1–O8 and the O7/O8 verification → merged-v3.md

Inputs: `merged-v2.md`, `out-verify-O7-O8.md` (this directory). Produce `merged-v3.md`: same 10 sections; §7 becomes "소유자 결정 기록" (what was decided, not options).

## Owner decisions (2026-09-26, review comments on merged-v2)
- O1 (가) accepted: `schemaType` widened, computed accepted-type list, `null` carried by `nullable` for union too.
- O2 (가) accepted.
- O3 (가) accepted. Add one clarifying sentence: object variant hosts (`oneOf`/`anyOf` whose branches are object schemas, with child subtrees at any depth) are untouched; O3 concerns only a slot without own `type` whose branches mix object/array with primitives.
- O4 **(나)**: at `bind`, an ajv instance with `coerceTypes`/`useDefaults`/`removeAdditional` on is refused with an error (name the error family from the ERROR ledger; no copy path). Mutating custom keywords (`modifying: true`) are undetectable; the contract states they are the consumer's responsibility. Remove the copy path from §5 and §10.
- O5 (가) accepted.
- O6 (가) accepted; add the owner's requirement explicitly: the input must be able to learn the schema's own type as well — satisfied by `props.schemaType` (keeps `'integer'`) and `props.jsonSchema`; state both in §4.
- O7/O8: owner delegated to verification ("정합하면 채택"). Verification found both incoherent as worded; the fixes below make them coherent. Adopt the fixed form.

## Unified principle replacing O7 and O8 (apply throughout §2, §3, §5)
**U1.** `type` across declarations of one slot is a conjunction: the accepted set is the **intersection** of the declarations' accepted sets (null included in the computation; `integer ⊂ number`). This is JSON Schema's own `allOf`/`then` meaning; no order dependence, no form-specific syntax. (Closes G1–G3; supersedes the subset rule.)
**U2.** An **empty** intersection is the only conflict: static → blueprint error (`ALL_OF_TYPE_REDEFINITION` where today's code uses it, else the kind-conflict code per ERROR-164); gated → conflict when the gates making it empty are on (existing runtime kind-conflict handling). `{null}` is not empty: it yields the null kind with `nullable: true`. (Closes F3.)
**U3.** **Static** declarations (body, gate-less `allOf` items, `$ref` targets) fix kind, `schemaType` and `nullable` at blueprint time from their intersection. Migration note: `{type:'number', allOf:[{type:['number','string']}]}` — today `ALL_OF_TYPE_REDEFINITION`, now a number node.
**U4.** **Gated** declarations (`then`/`else`, `controls.active` fragments, gated branches) never change kind, `schemaType`, `nullable` or input selection. While on, they narrow the node's **effective list** = `schemaType ∩ (accepted set of the active gated declarations)`; rule A, the default input and `valueTypeMismatch` use the effective list. This applies to **every** kind (a single-kind node is the one-element case: a number node gated to `integer` uses the integer rule while on). (Closes F5.)
**U5.** Effective list is per **node** (gates are per node), derived from the node's memoized effective schema (`BLUEPRINT-021`) whenever that memo changes, and shared as the frozen `schemaType` reference when no gate narrows it (the common case: zero cost). Add the merge-table row: effective-schema `type` merges by intersection. (Closes F2, F4.)
**U6.** Gate change without a write: the light is recomputed from the existing raw against the new effective list; the value is **not** re-interpreted (no retroactive conversion); `VALUE_TYPE_MISMATCH` is emitted when the light turns on, with `source: 'gate'`. Same as single-kind nodes, whose values are not re-read when a gate changes their constraints.
**U7 (F1).** Ordering inside one entry: values written in this entry (input write, `setValue`, load, fill) are interpreted at the write boundary with the list known then, and **once more in the transition phase against the final effective list of that entry**, for the written nodes only; nodes not written in this entry are never re-interpreted. Result: `setValue({kind:'num', a:'42'})` yields `a = 42` regardless of the previous state; mount and `reset()` follow the same two-step. Cost: one extra `interpret` per written union/gated node whose effective list changed in the same settle. Cite the SETTLE phase item this hooks into (transition phase, before commit).
**U8 (F6).** Remove the sentence extending this to gate-less branches; SCHEMA-008: branch constraints do not intersect.
**U9 (F7–F11).** Apply the verifier's wording fixes: notification path for effective-list change rides the existing `UpdateJsonSchema`-family event (name it from EVENT ledger); the warning record's `source` values include `'gate'`; the default input re-reads the effective list when it changes and re-runs its draft check on the current draft (no emission unless the draft now resolves); replace "지금 받는 형" wording with "유효 목록"; rename the payload field so `expected` does not collide with `schemaType` semantics (e.g. `expected: { schemaType, nullable, effective }`).

## Housekeeping
- §7 becomes the decision record (O1–O6 as decided, O7/O8 as U1–U9 with the verification reference).
- §8 ledger-change list: add rows for BLUEPRINT-011/012 (intersection principle), SCHEMA merge table (type row), VALUE-030 (light depends on effective list), SETTLE transition-phase re-interpret, VALIDATE-002/003 (bind refusal), ERROR (bind refusal code, `source: 'gate'`).
- §6 migration: add U3's row; remove the copy-path row; keep everything else.
- Verify new `path:line`s by opening files. Return the full `merged-v3.md`.
