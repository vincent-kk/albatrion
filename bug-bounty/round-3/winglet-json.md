# @winglet/json: bug bounty round 3

This round confirmed 2 new findings in `@winglet/json`. Items in the earlier round documents ([round 1](../round-1/winglet-json.md), [round 2](../round-2/winglet-json.md)) were treated as fixed and excluded. The main session re-ran every probe.

Probes: [probes/winglet-json/](probes/winglet-json/)

- From `r3-json`:
  - Probe folder in the working tree: `packages/winglet/json/src/__bounty__/r3-json/`; the round copy is `bug-bounty/round-3/probes/winglet-json/r3-json/`.
  - To run the copy: copy it back to `packages/winglet/json/src/__bounty__/r3-json/` and run `yarn workspace @winglet/json test --run src/__bounty__/r3-json/`.
  - `atomicity.r3.test.ts` holds the tests named `A` and `N`. `ca1-docs.test.ts` was written by a helper. It executes every documented example literally, and its tests are named after the document and line.
  - Failing tests that are not findings:
    - `A9` is a measurement. It shows that the reference implementation fast-json-patch 3.1.1, run without `mutateDocument`, also writes into a value it received from a root `replace`. The reference therefore does not decide item A; the package's own contract does.
  - Control tests that pass:
    - `A1b`: a non-root `add` of a caller value followed by a nested write leaves the value intact.
    - `A6`: a root `copy` followed by a write leaves the source intact.
    - `A7`: a root `move` followed by a write leaves the source intact.
    - `A8`: an immutable batch without root operations that fails midway leaves the source intact.
    - `N1`: `test` treats `-0` and `0` as equal at every depth.
    - `N2` and `N3`: `compare`, `difference` and `mergePatch` agree on `-0`, `1e21` and 2^53 + 1, and the `compare` and `applyPatch` round trip agrees on them.
    - 229 documented examples in `ca1-docs.test.ts` pass.
  - Verification limits: none. The helper replaced subpath imports with the package root, which re-exports the same functions. It skipped three examples that state no result: `docs/en/SPECIFICATION.md:659`, the `applyPatch` JSDoc example at line 86, and the `compare` JSDoc example at line 57.

Root-cause files: `packages/winglet/json/src/JSONPointer/utils/patch/applyPatch/`

## 1. In the default immutable mode, `applyPatch` writes into the caller's value object after a root `add` or `replace`, and changes the source document when that value is part of the source.

- Severity: high. The core immutability guarantee breaks in three ways:
  - A shared constant used to reset the document, such as `[{ op: 'replace', path: '', value: DEFAULTS }, ...edits]`, is silently changed.
  - A value taken from the source, such as `value: source.config`, changes the source document itself.
  - A batch that fails midway leaves those writes in place, and applying the same patch list a second time fails.
- Affected public API: `applyPatch`, from the package root and from `@winglet/json/pointer-patch`.
- Contract violated:
  - `packages/winglet/json/src/JSONPointer/utils/patch/applyPatch/DETAIL.md:7` states that the default immutable mode never changes the source.
  - `packages/winglet/json/src/JSONPointer/utils/patch/applyPatch/DETAIL.md:27` recommends the immutable default for atomic application.
  - `packages/winglet/json/src/JSONPointer/utils/patch/applyPatch/applyPatch.ts:22` says immutable mode preserves the source.
  - `packages/winglet/json/docs/agents/skills/json-skill/knowledge/patching-and-safety.md:56` says the default deep-clones first.
  - `packages/winglet/json/docs/agents/skills/json-skill/knowledge/patching-and-safety.md:76` says a failure leaves the original untouched.
  - `packages/winglet/json/docs/agents/skills/json-skill/SKILL.md:31` says the default keeps the source untouched on failure.
- Root cause:
  - `packages/winglet/json/src/JSONPointer/utils/patch/applyPatch/utils/applyRootOperation.ts:30-31` takes `patch.value` itself as the new root. The ownership step at `applyRootOperation.ts:54-64` runs only for `move`, so the new root is never recorded in the owned set.
  - Later operations walk from that root. `packages/winglet/json/src/JSONPointer/utils/patch/applyPatch/applySinglePatch.ts:159` starts at the root without checking whether it is owned, and lines 202-212 check only the children.
  - As a result, `packages/winglet/json/src/JSONPointer/utils/patch/applyPatch/utils/handleObject.ts:42` and `packages/winglet/json/src/JSONPointer/utils/patch/applyPatch/utils/handleArray.ts:37-42` write directly into the caller's object or array.
- Relation to earlier rounds: Same class as round 2 item 1 ([`../round-2/winglet-json.md`](../round-2/winglet-json.md) item 1). Both belong to the class of copy and immutability guarantees bypassed through the root. This is the second round in which this function and this class appear. The round 2 fix covered only a root `move`.
- Reopens an earlier fix: No.
  - `git log -L` on the root-cause lines shows only `deb639c8a` and `59c2bb734`. The first moved the ownership step into `applyRootOperation.ts` under round 2 item 8, and the second changed formatting.
  - The ownership step itself came from `18bffb3c2` (round 2 item 1), whose listed sibling scope covered only a root `move`.
- Reproduction: `packages/winglet/json/src/__bounty__/r3-json/atomicity.r3.test.ts`.
  - `A1`: a shared template `{ name: '' }` becomes `{ name: 'x' }` after a root `replace` and a `replace` of `/name`. Expected: the template is unchanged.
  - `A2`: after a root `replace` with `source.config` and an `add` of `/verbose`, the source gains `config.verbose: true`. Expected: the source is unchanged.
  - `A2b`: with a deeply frozen source, the same sequence throws `TypeError: Cannot assign to read only property 'flags'`. Expected: no error.
  - `A3`: a three-operation batch whose last `remove` fails leaves `b: 2` in the caller's value. Expected: the value is unchanged.
  - `A4`: applying `[{ replace '' { a: 1, b: 2 } }, { remove /b }]` a second time throws `PATCH_OBJECT_PROPERTY_NOT_FOUND`. Expected: `{ a: 1 }` both times.
  - `A5`: a root `add` of an array followed by an append changes the caller's array to `[1, 2, 3]`. Expected: `[1, 2]`.
- Confidence: high; public API, run through the package source.

## 2. Five documented examples of `@winglet/json` do not behave as written; in each case another document and the code agree on the actual behavior.

- Severity: low. A reader who follows these examples writes code that silently gets the wrong result or fails. The worst cases are:
  - change detection built on the README example, which never reports a change;
  - a JSONPath that keeps `$` and converts into a pointer that reads nothing;
  - error handling that waits for an exception `getValue` never throws.
- Affected public API: `setValue` with `compare`, `getValue`, `applyPatch`, `getJSONPath` and `convertJSONPathToPointer`, as the package documents present them.
- Contract violated:
  - `packages/winglet/json/README.md:285-296` says `compare(data, updated)` after `setValue` returns a `replace` of `/settings/app/version`. The actual result is `[]`, because `setValue` changes `data` in place and returns the same reference. `packages/winglet/json/docs/agents/skills/json-skill/knowledge/patching-and-safety.md:55` documents the in-place change.
  - `packages/winglet/json/README.md:372-384` imports `JSONPointerError` from `@winglet/json` and expects `getValue({}, '/nonexistent/path')` to throw. The class is not exported, and a missing location returns `undefined`. `packages/winglet/json/docs/en/SPECIFICATION.md:140`, `packages/winglet/json/docs/en/SPECIFICATION.md:625` and `packages/winglet/json/docs/agents/skills/json-skill/SKILL.md:55` document both points.
  - `packages/winglet/json/docs/en/SPECIFICATION.md:66-77` says the source is unchanged after the Quick Start `applyPatch(document, patches)`. The call actually throws `PATCH_OBJECT_PROPERTY_NOT_FOUND`, because the patches were computed from a different document that has `/age`.
  - `packages/winglet/json/docs/en/SPECIFICATION.md:490` says `getJSONPath` returns `null` for a primitive at a leaf. It actually returns the first path whose value is identical, for example `'$.a.b'` for `getJSONPath({ a: { b: 1 } }, 1)`. `packages/winglet/json/src/JSONPath/utils/getJSONPath/DETAIL.md` documents the first-match rule.
  - `packages/winglet/json/docs/en/SPECIFICATION.md:520-523` says `convertJSONPathToPointer('$.foo.bar')` returns `'/foo/bar'`. It actually returns `'/$/foo/bar'`, and the examples for `'$.users[0].name'`, `'$'` and `"$['a/b'].c"` differ the same way. `packages/winglet/json/docs/agents/skills/json-skill/knowledge/pointers-and-paths.md:93-102` and `packages/winglet/json/docs/agents/skills/json-skill/SKILL.md:66` document the actual behavior, in which `$` stays a key.
- Root cause: the documents are stale, not the code. For each example, the code matches another document of the same package, as listed above. The three README and SPEC pages were not updated when the agent documents and module documents were corrected.
- Relation to earlier rounds: Sibling of round 1 [`../round-1/winglet-json.md`](../round-1/winglet-json.md) item 7. Belongs to the class of documented examples that do not work.
  - The round 1 fix corrected `convertJSONPointerToPath` in the same SPEC but not the `convertJSONPathToPointer` section next to it.
  - The round 1 fix documented that `getValue` returns `undefined` at a missing location in the SPEC, but did not fix the README error-handling example.
  - None of the five places was reported in round 1 or in round 2 item 6.
- Reopens an earlier fix: No. `git log -L` on the cited lines shows no bug bounty commit.
- Reproduction: `packages/winglet/json/src/__bounty__/r3-json/ca1-docs.test.ts`. The failing tests are:
  - `README:295 Basic Usage compare(data, updated) yields the version replace patch`: actual `[]`.
  - `README:374 Error Handling imports JSONPointerError from the package`: actual `undefined`.
  - `SPEC:77 Quick Start applyPatch of those patches on document leaves document unchanged`: actual `PATCH_OBJECT_PROPERTY_NOT_FOUND`.
  - `SPEC:490 getJSONPath returns null for a primitive leaf target`: actual `'$.a.b'`.
  - `SPEC:520`, `SPEC:521`, `SPEC:522` and `SPEC:523` for `convertJSONPathToPointer`: actual `'/$/foo/bar'`, `'/$/users/0/name'`, `'/$'` and `"/$/'a/b'/c"`.
  - In every case the expected result is the value the document states.
- Confidence: high; public API, run through the package source.

## Hypotheses checked and not bugs

- From `r3-json`:
  - `test`, `compare` and `difference` treat `-0` and `0` as equal at every depth, which RFC 6902 section 4.6 requires for numbers ([RFC 6902 section 4.6](https://www.rfc-editor.org/rfc/rfc6902#section-4.6)).
  - `1e21` and 2^53 + 1 parse to the same double on both sides and produce no difference.
  - An immutable batch that fails midway leaves the source intact unless a root `add` or `replace` came first. Root `copy` and root `move` are already safe.
  - Patches that `compare` generates never put another operation after a root `replace`, so `compare` followed by `applyPatch` does not reach item A.
  - `#/a%2Fb` splitting into the two tokens `a` and `b` is correct, because RFC 6901 section 6 decodes the fragment before splitting ([RFC 6901 section 6](https://www.rfc-editor.org/rfc/rfc6901#section-6)).

## Open leads

- From `r3-json`:
  - `convertJSONPointerToPath('//x')` drops the empty-string key and returns the same `'.x'` as `'/x'`, judging from the code at `packages/winglet/json/src/JSONPointer/utils/convertJSONPointerToPath/convertJSONPointerToPath.ts:41-46`. It was not probed. It resembles the known limit for empty keys in `getJSONPath` from round 2.
