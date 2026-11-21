# @canard/schema-form-ajv6-plugin: bug bounty round 6

4 new findings in `@canard/schema-form-ajv6-plugin`: 1 medium and 3 low. Items in [round 1](../round-1/canard-schema-form-ajv6-plugin.md), [round 2](../round-2/canard-schema-form-ajv6-plugin.md), [round 3](../round-3/canard-schema-form-ajv6-plugin.md), [round 4](../round-4/canard-schema-form-ajv6-plugin.md), [round 5](../round-5/canard-schema-form-ajv6-plugin.md) are treated as fixed and excluded, together with recorded decisions and known limits. The main session re-runs every probe: `r6-ajv-ownership` runs 5 tests with 1 failure, and `r6-ajv-compile` runs 12 tests with 4 failures. The main session's earlier-probe audit for this package runs 102 tests with 5 failures under default configurations, including the round 4 folders, and finds no regression; its hunter uses retained round 4 source configurations where required. None of this document's items is a regression, and every item repeats a watch-list point.

Probes: [probes/canard-schema-form-ajv6-plugin/](probes/canard-schema-form-ajv6-plugin/)

- Copy each hunter folder back to `packages/canard/schema-form-ajv6-plugin/src/__bounty__/<hunter-id>/`. Run `yarn workspace @canard/schema-form-ajv6-plugin test --run src/__bounty__/r6-ajv-ownership/` and `yarn workspace @canard/schema-form-ajv6-plugin test --run src/__bounty__/r6-ajv-compile/`. The probes import plugin source. The ownership test forces garbage collection through the runtime and observes the internal realm ledger; its Form-isolation controls pass, although `formIsolation.test.ts` has probe-only type errors.
- Every failing new probe belongs to an item below. Pointer-target, standard-position, native-validator and live-sibling controls pass. The rewritten `facts.test.ts` macro checks pass; setup defects in its earlier version are superseded and are not findings.
- Earlier probes re-run (`r6-rerun-packages`): the hunter's per-round registered/failing counts for rounds 1 through 5 are 4/0, 4/0, 15/2, 21/0 and 60/3. The two round 3 draft-support failures are recorded documentation decisions. `r5-r5-ajv-ownership/compiledApplicationSchema.test.ts` is a diagnostic of the old release mechanism. The failing historical rows in `r5-r5-ajv-results/asyncFormat.test.ts` and `repeatedAsyncCompile.test.ts` deliberately run failing archived implementations, rather than current code. No earlier fixed finding fails for its original reason. Full retained earlier folders stay in the earlier round records rather than being copied into this round's probe archive; the hunter's per-round table supplies each failing test's role and retains its configuration qualification.

Root-cause files: `packages/canard/schema-form-ajv6-plugin/src/validator/`

## 1. An anchor target inside a non-standard container misses compile facts, so an asynchronous format crashes compilation and a replaced format keeps its old verdict.

- Severity: medium. A schema using a plain-name anchor inside an application container such as `components` loses validation through a compile error or silently retains an obsolete format verdict.
- Affected public API: `createValidator(ajv).compile`, `createValidatorFactory` and `plugin.validator` compilation.
- Contract violated: the compile-facts decision in `../round-5/FIXES.md` includes every position compiled by the native validator, including non-standard containers; `packages/canard/schema-form-ajv6-plugin/CLAUDE.md` requires invalidation when a used format changes. Native AJV compiles the same schema. The shared model is explicit at `packages/canard/schema-form-ajv8-plugin/DETAIL.md:69`.
- Root cause: `packages/canard/schema-form-ajv6-plugin/src/validator/utils/privateCompiler/collectSchemaDependencies.ts:85` and line 96 omit draft-07 `$id: '#leaf'` or an anchor when the base is empty. `packages/canard/schema-form-ajv6-plugin/src/validator/utils/privateCompiler/walkReferencedSchemas.ts:33` drops non-pointer fragments, so the referenced target under an unknown keyword never receives assertion traversal or records its format.
- Relation to earlier rounds: the reference-dependency follow-up to [round 5 item 4](../round-5/canard-schema-form-ajv6-plugin.md) covers pointer fragments but leaves this anchor input uncovered.
- Reopens an earlier fix: the round 5 compile-facts follow-up, `c3dfc84ec`, associated with [round 5 item 4](../round-5/canard-schema-form-ajv6-plugin.md).
- Regression of an earlier fix: no. Static inspection shows reference targets are not walked before that follow-up either.
- Watch list: yes, compile facts and cache invalidation.
- Reproduction: `r6-ajv-compile/anchorFacts.test.ts`, the "async format reached by anchor compiles and rejects" rows, throws `async format in sync schema`, expected a `format` issue for `'ab'` and `null` for `'abcd'`. The "replaced format reached by anchor is observed on recompile" rows retain the old format issue, expected `null`. Pointer targets and anchor targets with a root `$id` or under `definitions` pass.
- Confidence: high; public validator compilation from source, with native-validator and covered-position controls.

## 2. A collected adapter retains its registrations and one private compiler per visit while the caller's schema root stays alive.

- Severity: low. Repeated direct-adapter visits grow registrations and private compiler memory without bound, but the Form component's validator-keyed schema copies keep that path outside the affected case.
- Affected public API: `createValidator(ajv).compile`, `compileGuard`, `release` and `createValidatorFactory(ajv)` with a long-lived caller root.
- Contract violated: the registration-lifetime model in `packages/canard/schema-form-ajv6-plugin/DETAIL.md`; `packages/canard/schema-form-ajv8-plugin/DETAIL.md:51` explicitly requires cleanup when either a root or an adapter is collected, and line 85 forbids retaining roots or adapters strongly.
- Root cause: `packages/canard/schema-form-ajv6-plugin/src/validator/utils/registerSchemaRoot.ts:112` registers only the root as the finalization target. The per-instance finalizer at `packages/canard/schema-form-ajv6-plugin/src/validator/utils/instanceIdRegistrationsOf.ts:50-51` lives with the application's validator instance and retains each registration while the root lives. Collecting the adapter removes the owner able to call release; pruning removes only dead or explicitly released slots. Namespace isolation allocates another compiler for each surviving root registration with `$id`.
- Relation to earlier rounds: same class as [round 5 item 3](../round-5/canard-schema-form-ajv6-plugin.md), cleanup after the adapter owner disappears.
- Reopens an earlier fix: [round 5 item 3](../round-5/canard-schema-form-ajv6-plugin.md), `2696493f2`.
- Regression of an earlier fix: no. The predecessor already leaks a long-lived root when its adapter disappears; the new input does not establish a correct earlier result.
- Watch list: yes, registration ownership and compiler lifetime; the low rating is below the repeat threshold for another round.
- Reproduction: `r6-ajv-ownership/collectedAdapterOwnership.test.ts`, "FP5: collected per-route adapters do not keep their registrations of a long-lived root", keeps one shared adapter and drops 40 visit adapters. After forced collection, actual `{ survivors: 0, live: 40, compilers: 41 }`; expected `{ survivors: 0, live: 0, compilers: 1 }`. The four Form-isolation controls pass.
- Confidence: high for the leak, medium for its frequency; public `createValidator` with forced garbage collection and internal-ledger observation, rather than a browser memory measurement.

## 3. A reference fragment containing a percent-encoded slash is refused although the native validator compiles it.

- Severity: low. The uncommon reference spelling `#/components/a%2Fb` loses validation through an unresolved application reference.
- Affected public API: compilation through `createValidator`, `createValidatorFactory` and `plugin.validator`.
- Contract violated: parity with native AJV, which resolves the fragment to the key `a/b`; the read-only compiler model in `packages/canard/schema-form-ajv6-plugin/CLAUDE.md` preserves native schema interpretation.
- Root cause: `packages/canard/schema-form-ajv6-plugin/src/validator/utils/privateCompiler/walkReferencedSchemas.ts:34` decodes the entire fragment before `readPointer(..., false)` splits it on slashes. `packages/canard/schema-form-ajv6-plugin/src/validator/utils/privateCompiler/readPointer.ts:14`, also used by `packages/canard/schema-form-ajv6-plugin/src/validator/utils/privateCompiler/readApplicationResource.ts:60`, uses the same order. Native AJV splits first and decodes each segment, preserving an encoded slash within its key.
- Relation to earlier rounds: same class as [round 2 AJV 8 item 1](../round-2/canard-schema-form-ajv8-plugin.md), percent-encoding and pointer interpretation, with a different reference traversal mechanism.
- Reopens an earlier fix: no.
- Regression of an earlier fix: no.
- Watch list: yes, compile facts and reference resolution.
- Reproduction: `r6-ajv-compile/nativeParity.test.ts`, "a key containing a slash referenced with %2F imports its application reference", throws `can't resolve reference app-check from id #`, expected a `minLength` issue. The native diagnostic selects `a/b`, and the `~1` spelling control passes.
- Confidence: high; public plugin compilation from source compared with the native validator on the same shape.

## 4. A reference target in an array under a non-standard key ignores its enclosing element's identifier.

- Severity: low. A valid but unusual container shape loses validation because a relative reference cannot resolve.
- Affected public API: compilation through `createValidator`, `createValidatorFactory` and `plugin.validator`.
- Contract violated: native-validator parity for `$id` inheritance along the reference target path, as preserved by the compiler model in `packages/canard/schema-form-ajv6-plugin/CLAUDE.md`.
- Root cause: `packages/canard/schema-form-ajv6-plugin/src/validator/utils/privateCompiler/walkSchemas.ts:75` skips arrays under keys outside `ARRAYS`, so their elements acquire no base. `packages/canard/schema-form-ajv6-plugin/src/validator/utils/privateCompiler/collectSchemaDependencies.ts:116` falls back to the registration key without reading the identifier of an unwalked ancestor.
- Relation to earlier rounds: new class in reference-base inheritance. Item 1 of this document concerns the same broad reference traversal area but has a different mechanism.
- Reopens an earlier fix: no.
- Regression of an earlier fix: no.
- Watch list: yes, compile facts and reference resolution.
- Reproduction: `r6-ajv-compile/nativeParity.test.ts`, "a reference target inside an array container resolves against its enclosing $id", throws `can't resolve reference check from id`, expected a `minLength` issue. The equivalent object-container row passes.
- Confidence: high; public plugin compilation from source with native parity and an object-container control.

## Hypotheses checked and not bugs

- A macro expanding to a reference into an application document fragment compiles and reports the target failure, with or without a root identifier. A macro expanding to a local pointer whose target references an application schema compiles without a root identifier; the failing rooted variant also fails natively and is excluded.
- Pointer references into non-standard containers record asynchronous formats and observe replacement. Anchors work with a root identifier or inside `definitions`. A `~1`-escaped key resolves, and identifier inheritance through an object-valued non-standard container matches native behavior.
- Live sibling registrations remain isolated when a later application alias shares an embedded identifier, including after release of another form. A released root identifier does not redirect a later root-pointer guard. The core's validator-keyed copies and recently released-root list keep item 2 outside normal Form use.
- Static checks preserve overlapping live identifier isolation and release ordering. Root-pointer guards count pool rotation per `compileGuard` call, rather than only new roots; the loose description has a cost effect without a correctness finding.
- The content-keyed native cache preserves the second equal root snapshot after the first is released. Application-keyword subschema compilation is not probed because this native version has no in-place subschema API.
- Retained ownership, dropped-adapter, asynchronous-format, repeated-compile, keyword-exception and late-definition probes do not reproduce their fixed mechanisms. Historical snapshots remain historical diagnostics rather than current failures.
