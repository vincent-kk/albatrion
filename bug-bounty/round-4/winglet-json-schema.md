# @winglet/json-schema: bug bounty round 4

This round confirmed 1 new finding in `@winglet/json-schema`, a low one. Items in the earlier round documents ([round 1](../round-1/winglet-json-schema.md), [round 2](../round-2/winglet-json-schema.md), [round 3](../round-3/winglet-json-schema.md)) were treated as fixed and excluded. The main session re-ran every probe: the `r4-contracts` folder ran 2 tests, of which 1 fails and 1 control passes. Hunter `r4-json-style` wrote no probe for this package, and its checks below come from reading the code.

Probes: [probes/winglet-json-schema/](probes/winglet-json-schema/)

- From `r4-contracts`:
  - Probe folder in the working tree: `packages/winglet/json-schema/src/__bounty__/r4-contracts/`; the round copy is `bug-bounty/round-4/probes/winglet-json-schema/r4-contracts/`.
  - To run the copy: copy it back to `packages/winglet/json-schema/src/__bounty__/r4-contracts/` and run `yarn workspace @winglet/json-schema test --run src/__bounty__/r4-contracts/node10RootTypes.test.ts`. No probe-local configuration is needed.
  - Failing tests that are not findings: none. The failing test reproduces item 1.
  - Control tests that pass: "control: a node16 ESM consumer reads the inherited BaseError member".
  - Verification limits: the probe drives the TypeScript compiler API on a consumer in a temporary directory under `os.tmpdir()`, which links `@winglet/json-schema`, `@winglet/common-utils` and `@winglet/json` from the working tree. It therefore reads their stale `dist` declarations, built before the round 1 to 3 fixes. The import line that causes item 1 is the same in that `dist` (`dist/utils/JSONSchemaScanner/utils/error/JSONSchemaScanError.d.ts:1`) and in the current source, so item 1 is recorded as static only and should be re-run after a rebuild.

Root-cause files: `packages/winglet/` (`json-schema/src/utils/JSONSchemaScanner/utils/error/JSONSchemaScanError.ts` and the manifest `common-utils/package.json`, which declares no `typesVersions`)

## 1. Under `moduleResolution: node10`, `JSONSchemaScanError` from the package root loses `group`, a member it inherits from `BaseError`, because the root declarations import `BaseError` from the `@winglet/common-utils/error` subpath, which node10 cannot resolve.

- Severity: low. A CommonJS TypeScript project on `node10` resolution, which TypeScript 5.9 still uses by default for `module: commonjs`, gets error TS2339 when it reads `group` on a scan error, even with `skipLibCheck: true`. The documented `code` member is unaffected, because `JSONSchemaScanError` declares it again.
- Affected public API: `JSONSchemaScanError` from the `@winglet/json-schema` root.
- Contract violated:
  - The known limit recorded for round 3 at `bug-bounty/round-3/FIXES.md:513` ([round 3 fixes](../round-3/FIXES.md)) says that a node10 consumer still resolves the package root through the top-level `types` field and that only subpath types do not resolve. The root of this package does not fully resolve either.
  - `packages/winglet/json-schema/src/utils/JSONSchemaScanner/utils/error/JSONSchemaScanError.ts:6` declares `JSONSchemaScanError extends BaseError`, which promises the public members of `BaseError`; `packages/winglet/common-utils/src/errors/BaseError.ts:7` declares `group`.
- Root cause: `packages/winglet/json-schema/src/utils/JSONSchemaScanner/utils/error/JSONSchemaScanError.ts:1` imports `BaseError` from `@winglet/common-utils/error`. node10 ignores `exports`, and `packages/winglet/common-utils/package.json` declares no `typesVersions`, so the subpath does not resolve. With `skipLibCheck: true` the failure is silent, and the class loses its base type.
- Relation to earlier rounds: Same class as [round 3 item 6](../round-3/winglet-common-utils.md), declarations that a valid consumer configuration cannot use (round 3 class 30). The same mechanism makes `FormHandle.submit` untyped in `@canard/schema-form` ([canard-schema-form item 19](canard-schema-form.md)), and an unprobed instance in `@lerx/promise-modal` is listed under the open leads of [lerx-promise-modal](lerx-promise-modal.md).
- Reopens an earlier fix: No. `git log -L` on `JSONSchemaScanError.ts:1` shows only `89598a63d`, a feature commit, and no bug bounty fix.
- Reproduction: `packages/winglet/json-schema/src/__bounty__/r4-contracts/node10RootTypes.test.ts`, "a node10 consumer of the package root reads the inherited BaseError member". A `type: commonjs` consumer with `module: commonjs`, `moduleResolution: node10` and `skipLibCheck: true` reads `error.group`. Actual: `["TS2339 Property 'group' does not exist on type 'JSONSchemaScanError'."]`. Expected: `[]`. The control with a node16 ES module consumer passes.
- Confidence: high for the mechanism; static only, because the probe reads the stale `dist` declarations whose import line matches the current source. The other members that `JSONSchemaScanError` inherits were not checked one by one.

## Hypotheses checked and not bugs

- From `r4-json-style`:
  - `isIdenticalSchemaType` gives consistent results for every spelling of a nullable and a non-nullable string. The spellings checked are:
    - a single type with `nullable: true`;
    - type arrays in either order;
    - one-element arrays with and without `nullable`;
    - an explicit `nullable: false`.
  - The round 3 item 2 fix also compares `nullable` when both schemas share the same type string or the same array reference.
  - `isCompatibleSchemaType` ignores nullability in the same way for the `nullable: true` spelling and for the type-array spelling.
  - The type guards (`isArraySchema` and its siblings) ignore the OpenAPI `nullable: true` flag. `docs/en/SPECIFICATION.md:379` and `src/filters/DETAIL.md:6` document this.
  - After a rejected indexing attempt, `ResolverStore.discard` removes every resource and anchor that the attempt registered. The retry builds a new root context, so cached child contexts from the failed attempt are unreachable.
  - `$anchor`, `$dynamicAnchor` and draft fragment identifiers all register through `registerAnchors`, so the round 3 item 1 rollback covers all three.

## Open leads

- From `r4-json-style`:
  - `normalizeSchemaUri` lowercases the scheme and host of a `$schema` URI but keeps a default port. Judging from the code at `packages/winglet/json-schema/src/utils/JSONSchemaScanner/utils/dialectFlag/normalizeSchemaUri.ts`, `http://json-schema.org:80/draft-07/schema#` would fall back to the default dialect, although RFC 3986 section 6.2.3 treats the two spellings as equivalent ([RFC 3986 section 6.2.3](https://www.rfc-editor.org/rfc/rfc3986#section-6.2.3)). It was not probed, and such a spelling is unlikely in real schemas.
