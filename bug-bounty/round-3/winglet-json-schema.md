# @winglet/json-schema: bug bounty round 3

This round confirmed 3 new findings in `@winglet/json-schema`. Items in the earlier round documents ([round 1](../round-1/winglet-json-schema.md), [round 2](../round-2/winglet-json-schema.md)) were treated as fixed and excluded. The main session re-ran every probe. Verification limits are listed under the probes.

Probes: [probes/winglet-json-schema/](probes/winglet-json-schema/)

- From `r3-contracts`:
  - Probe folder in the working tree: `packages/winglet/json-schema/src/__bounty__/r3-contracts/`; the round copy is `bug-bounty/round-3/probes/winglet-json-schema/r3-contracts/`.
  - To run the copy: copy it back to `packages/winglet/json-schema/src/__bounty__/r3-contracts/` and run `yarn workspace @winglet/json-schema test --run src/__bounty__/r3-contracts/identicalNullable.test.ts`.
  - Failing tests that are not findings: none.
  - Control tests that pass: "control: a null-bearing type array differs from the non-nullable type" and "control: the two nullable spellings are identical".
  - Verification limits: None.
- From `r3-json`:
  - Probe folder in the working tree: `packages/winglet/json-schema/src/__bounty__/r3-json/`; the round copy is `bug-bounty/round-3/probes/winglet-json-schema/r3-json/`.
  - To run the copy: copy it back to `packages/winglet/json-schema/src/__bounty__/r3-json/` and run `yarn workspace @winglet/json-schema test --run src/__bounty__/r3-json/`.
  - `resolver.r3.test.ts` holds the tests named `F`, `B` and `E`. `ca1-docs.test.ts` was written by a helper; it executes every documented example literally and is a control.
  - Failing tests that are not findings:
    - `F1d` is a diagnostic for item B. It shows that the repeated scan inlines the rejected document as `{ type: 'string', $defs: { one: { type: 'number' }, two: { type: 'boolean' } } }`, with both conflicting `$id` keywords removed.
    - `F4` is a diagnostic for item B. On the lookup-miss path, the repeated scan reports a different duplicate: `https://ex.example/types.json declared at https://ex.example/types.json# and https://ex.example/types.json#`, which names one document against its own partial copy.
    - `E2` is a rejected hypothesis. A `$id` and a `$ref` that differ only in percent-encoding hex case (`%2f` and `%2F`) do not resolve to each other. Rejected because such input is unlikely in real schemas.
    - `E3` is a rejected hypothesis. A `$id` with `%7E` and a `$ref` with a raw `~` do not resolve to each other. Rejected for the same reason.
    - `B2` is a rejected hypothesis. `limits.referenceChain: NaN` silently disables the chain bound, because every comparison with `NaN` is false. Rejected because `NaN` is an unlikely configuration value.
  - Control tests that pass:
    - `F1b`: a fresh resolver reports `duplicate-identifier` every time.
    - `B1`: the default chain limit of 32 throws `reference-chain-limit`.
    - `E4`: an empty fragment, a default port, dot segments and an upper-case scheme or host in `$ref` resolve to the same resource.
    - All 67 documented examples in `ca1-docs.test.ts` pass.
  - Verification limits: In `ca1-docs.test.ts`, the helper replaced subpath imports with the package root and checked type-level examples only at runtime. `createReferenceResolver` and `resolveReference` have no JSDoc `@example` blocks to check.

Root-cause files: `packages/winglet/json-schema/src/`

## 1. After the built-in resolver fails with `duplicate-identifier` while indexing a document, a repeated lookup on the same resolver inlines that document without an error.

- Severity: medium. A failure is later reported as success, but only when a resolver is reused after an invalid document:
  - A server or editor that keeps one resolver sees the duplicate identifier on the first scan only. Later scans silently inline the rejected document.
  - With the asynchronous resolver, later scans serve the rejected document without calling `load` again.
- Affected public API: `createReferenceResolver` with `resources`, and `createReferenceResolverAsync` with `load`, used by `JSONSchemaScanner` and `JSONSchemaScannerAsync`.
- Contract violated:
  - `packages/winglet/json-schema/src/utils/JSONSchemaScanner/createReferenceResolver/DETAIL.md:17`: a check that ends in an error returns its address to the unchecked state, because otherwise a repeated lookup on the same resolver would return the embedded resource instead of the error.
  - `packages/winglet/json-schema/docs/en/SPECIFICATION.md:107`: a later explicit resolve retries a rejected request.
  - Predictability: the same call repeated on the same resolver should give the same result.
- Root cause:
  - `packages/winglet/json-schema/src/utils/JSONSchemaScanner/createReferenceResolver/utils/ResolverStore/ResolverStore.ts:252-263` registers each resource in `resources` while the document is still being indexed, and `ResolverStore.ts:370-384` does the same for anchors.
  - When a later declaration in the same document throws, nothing removes those entries, and `ResolverStore.ts:289-290`, which completes the document's registration, never runs.
  - The next lookup finds the registered root resource. `ensure` returns true at `ResolverStore.ts:397-408`, and `add` skips the address at `ResolverStore.ts:491-494`. In the asynchronous resolver, `packages/winglet/json-schema/src/utils/JSONSchemaScanner/createReferenceResolver/utils/createReferenceResolverAsync/createReferenceResolverAsync.ts:24` therefore skips `load`.
- Relation to earlier rounds: Sibling of round 1 [`../round-1/winglet-json-schema.md`](../round-1/winglet-json-schema.md) item 1, specifically the additional fix `5c58a969e`, which made a failed registration check repeat its error on the same resolver. That fix covered the `settle` path. This item reaches the same outcome through partial registration during indexing. Belongs to the class of errors that vanish and state that sticks.
- Known limit it goes past: the round 1 known limit says a run whose lookups never miss does not report duplicates in the documents it never indexes. That limit is about unreferenced documents. This item concerns a document that was referenced, indexed and rejected.
- Reopens an earlier fix: No.
  - `git log -L` shows round 1 item 1 commits on the root-cause lines: `64ddf160b` on the indexing lines, and `ddeb1e524`, `baada168d`, `2a7473f7e` and `71bd678cf` on `ensure`.
  - This failure is outside the cases those fixes listed, so it is a missed sibling, not a regression.
- Reproduction: `packages/winglet/json-schema/src/__bounty__/r3-json/resolver.r3.test.ts`.
  - `F1`: the second scan with the same resolver returns error code `undefined`. Expected: `duplicate-identifier`.
  - `F1c`: after the failure, a `$ref` to `dup.json`, which only the rejected document declares, resolves without error. Expected: `duplicate-identifier`.
  - `F2`: with the asynchronous resolver, the result is `{ first: 'duplicate-identifier', second: undefined, calls: 1 }`. Expected: `{ first: 'duplicate-identifier', second: 'duplicate-identifier', calls: 2 }`.
  - `F3`: a document with a duplicate `$anchor` gives `['duplicate-identifier', undefined]`. Expected: `['duplicate-identifier', 'duplicate-identifier']`.
- Confidence: high; public API, run through the package source.

## 2. `isIdenticalSchemaType` ignores `nullable: true` when both type spellings are equal, so it reports a nullable string as identical to a non-nullable string.

- Severity: low. `isIdenticalSchemaType({ type: 'string', nullable: true }, { type: 'string' })` returns `true`, while the equivalent `isIdenticalSchemaType({ type: ['string', 'null'] }, { type: 'string' })` returns `false`, so a consumer comparing schemas misses a change in nullability, and the relation is not transitive.
- Affected public API: `isIdenticalSchemaType` from the root entry and `./filter`.
- Contract violated: the JSDoc at `packages/winglet/json-schema/src/filters/isIdenticalSchemaType.ts:6-12` ("considering nullable", with the OpenAPI `nullable: true` spelling), `packages/winglet/json-schema/docs/agents/skills/json-schema-skill/knowledge/type-inference.md:54`, `packages/winglet/json-schema/docs/en/SPECIFICATION.md:379` ("Comparison functions … normalize OpenAPI nullable:true") and `packages/winglet/json-schema/src/filters/DETAIL.md:28`.
- Root cause: `packages/winglet/json-schema/src/filters/isIdenticalSchemaType.ts:37` returns `true` as soon as the two `type` values are the same reference or string, before nullability is compared, and the one-element-array branch at `:62` also ignores `nullable`.
- Relation to earlier rounds: Same class as round 2 class 3, spelling variants of the same thing (here `nullable: true` against `'null'` in the type array).
- Reopens an earlier fix: No. The lines date from #285.
- Reproduction: `identicalNullable.test.ts`, "a nullable: true string differs from the non-nullable string, like its type-array spelling does": the actual result is `true` for all four cases (single type, reversed arguments, one-element array, shared array reference), the expected result is `false`.
- Confidence: high; verified through the public API.

## 3. A `$schema` URI whose scheme or host is written in upper case is not recognized, so the scanner silently uses the fallback dialect.

- Severity: low. A schema that declares `HTTP://json-schema.org/draft-04/schema#` or `http://JSON-SCHEMA.ORG/draft-04/schema#` is scanned as 2020-12. Inert positions, identifier keywords and reference processing then differ from the lower-case spelling of the same URI. Such spellings are uncommon in practice.
- Affected public API: `JSONSchemaScanner`, `JSONSchemaScannerAsync`, and the `dialects` option of `createReferenceResolver` and `createReferenceResolverAsync`.
- Contract violated:
  - `packages/winglet/json-schema/docs/en/SPECIFICATION.md:186` states that supported HTTP and HTTPS spellings are normalized.
  - [RFC 3986 section 6.2.2.1](https://www.rfc-editor.org/rfc/rfc3986#section-6.2.2.1) states that scheme and host are case-insensitive.
- Root cause: `packages/winglet/json-schema/src/utils/JSONSchemaScanner/utils/dialectFlag/normalizeSchemaUri.ts:7` only replaces a lower-case `https:` prefix and removes a trailing `#`. `packages/winglet/json-schema/src/utils/JSONSchemaScanner/utils/dialectFlag/detectDialect.ts:19` then looks the result up by exact string, so any other case falls through to the fallback dialect.
- Relation to earlier rounds: Sibling of round 1 [`../round-1/winglet-json-schema.md`](../round-1/winglet-json-schema.md) item 4, where `resources` keys were matched only in their normalized spelling. Belongs to the class of spelling variants of paths and names.
- Reopens an earlier fix: No. `git log -L` shows only `89598a63d`.
- Reproduction: `packages/winglet/json-schema/src/__bounty__/r3-json/resolver.r3.test.ts`, test `E1`. The lower-case declaration marks `#/contains` inert, giving `['#/contains']`. The upper-case scheme and the upper-case host both give `[]`. Expected: `['#/contains']` for all three.
- Confidence: medium; public API, run through the package source. The behavior is certain; the likelihood of such input in real schemas is low.

## Hypotheses checked and not bugs

- From `r3-contracts`:
  - None beyond the item.
- From `r3-json`:
  - Exceptions from user callbacks and custom resolvers propagate unchanged, because the scan engine has no `try` or `catch` around them. A failed scan clears its output, as the specification states.
  - A `load` function that throws synchronously becomes a rejected request and is removed from the request cache, because the call is wrapped in `Promise.resolve().then`.
  - The rejected-loader retry at `packages/winglet/json-schema/docs/en/SPECIFICATION.md:107` behaves as documented when the loaded document itself is valid; the loader is called twice.
  - All documented examples run as written:
    - README lines 19 and 43;
    - the specification examples walk, mutate, inline, load, custom, inert, keywords, relocation, opaque, errors, guards, types and tuple;
    - the skill knowledge examples;
    - the JSDoc examples of both scanners and every filter.
  - An empty fragment, a default port, dot segments and an upper-case scheme or host in `$ref` resolve to the same resource.
