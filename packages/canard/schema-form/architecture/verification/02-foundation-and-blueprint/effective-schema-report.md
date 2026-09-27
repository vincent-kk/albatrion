# Effective schema and validator schema evidence

## Scope

The blueprint-owned merger implements SCHEMA-007–014, SCHEMA-039, SCHEMA-044/045 and the effective-schema acceptance group. It selects ungated declarations and explicitly selected gated IDs, orders them by authored position, and leaves state/value/action policies in their raw declarations. A declaration-context contribution applies only when it is the sole declaration; declaration-context overlays and validation-only fragments do not contribute. Fragment controls never become host controls (CONTROLS-042/077).

The merger uses immutable common-utils merging for options/presentation, replaces arrays, retains single-contribution references, supports an injected atomic predicate, and omits options.virtual. Types intersect with integer as a subset of number. Unchanged scalar/union types reuse node.schemaType. Static failures report the contributing schema path. Runtime enum/const contradictions remain an empty enum (with conflicting const removed); ranges remain inverted. A gated runtime type conflict also returns an empty enum hint, never an invalid empty type array; the settlement layer must diagnose that conflict using the retained raw declarations. These causes are tested separately.

Memo partitions are weak by node and separate static/runtime mode and atomic predicate identity. The normalized effective contribution IDs select the shared schema within each partition.

The validator-schema group strips only controls/options/presentation at schema positions. Literal const/enum/default/examples/custom data retain their contents and references. No legacy stripSchemaExtensions consumer was changed.

## Dialect and scanner findings

- Draft-04 boolean exclusive bounds must stay paired with their original minimum/maximum. They are retained as allOf clauses; the representative minimum/maximum still intersects. No top-level boolean exclusive bound is synthesized, and no canonical dialect is selected (GOAL-018). Regression examples distinguish a lower exclusive bound of 1 with inclusive 2 from equal bounds of 2 where one is exclusive.
- The existing scanner stops descending at unresolved $ref. The stripping adapter temporarily hides the reference from traversal, restores it on exit, and never expands it. Frozen sources, nested $defs, boolean subschemas and recursive reference strings are covered.
- Whole-object cloning preserves aliases. Reassembling scanner replacements could therefore remove groups from a default value that aliases a schema occurrence. The adapter now copies each visited schema and its schema-child containers before reassembly, leaving literal data untouched. The regression uses one authored object as two property schemas and as default data.
- EXTENDED_KEYWORDS deliberately excludes draft-07 dependencies. The stripping adapter adds it as a schema map while skipping string-array dependency data. Both forms and a boolean dependency are covered. The scanner package itself was not changed.
- TEST-067 scanner reuse findings were shared with the analyzer worker. Final target tests ran after the root rebuilt @winglet/json-schema from the current workspace source; generated build artifacts are excluded from the commit.

## Evidence

Commands run from the repository root unless stated otherwise.

| Check | Result | Evidence |
| --- | --- | --- |
| Initial new API red | Both new function modules absent | effective-schema-red.log |
| First target implementation | 21 tests passed | effective-schema-tests.log |
| Draft-04 / literal alias regression red | 2 failed, 22 passed | effective-schema-edge-red.log |
| Draft-04 / literal alias corrections | 24 passed | effective-schema-edge-tests.log |
| Fragment scope / validation-only red | 2 failed, 13 passed | effective-schema-scope-red.log |
| Draft-07 dependency red | 1 failed, 9 passed | effective-schema-dependencies-red.log |
| Final target contracts | 2 files, 25 tests passed; exit 0 | effective-schema-final-tests.log |
| Package lint | exit 0 | effective-schema-package-lint.log |
| Package strict during parallel implementation | exit 2; no merger/strip/harness errors | effective-schema-package-strict-final.log |

Final target command:

```sh
yarn workspace @canard/schema-form test --run --project unit src/core/blueprint/__tests__/mergeEffectiveSchema.test.ts src/core/blueprint/__tests__/stripSchema.test.ts
yarn workspace @canard/schema-form lint
yarn workspace @canard/schema-form typecheck --strict
```

The final strict snapshot contains three existing-engine schemaNodeFactory nullable-constructor errors (BooleanSchema, NumberSchema, StringSchema). The root is handling these alongside the full stage gate. This worker does not claim the package strict gate is passed. The earlier strict snapshot is retained separately because the analyzer and legacy type repairs were changing concurrently.

The effective-schema spec contains 15 cases and validator-schema spec 10 cases, each tied to its distinct existing DETAIL acceptance group. These checks do not replace full legacy tests, stage benchmarks, filid scan, seiri gate or independent reviews.

## Source handoff

All changes below are new files under the existing blueprint owner; the worker made no commit and did not edit ledger/plan documents.

- `src/core/blueprint/utils/effectiveSchema/` — merger and its owned helpers.
- `src/core/blueprint/utils/stripSchema/` — stripping adapter, vocabulary and owned helpers.
- `src/core/blueprint/__tests__/mergeEffectiveSchema.test.ts`.
- `src/core/blueprint/__tests__/stripSchema.test.ts`.
- `src/core/blueprint/__tests__/fixtures/createEffectiveSchemaNode.ts`.

Entry-point exports, analyzer invocation, shared declaration scope metadata and blueprint documents are coordinated by the root and analyzer worker. The artifact paths in this report are relative to this report directory unless they begin with src/.
