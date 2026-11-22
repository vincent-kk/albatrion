# @winglet/json: bug bounty round 4

This round confirmed 3 new findings in `@winglet/json`: one medium and two low. Items in the earlier round documents ([round 1](../round-1/winglet-json.md), [round 2](../round-2/winglet-json.md), [round 3](../round-3/winglet-json.md)) were treated as fixed and excluded. The main session re-ran every probe with the probe-local configuration: 12 tests ran, the 6 that fail are the findings, and 6 pass.

Probes: [probes/winglet-json/](probes/winglet-json/)

- From `r4-json-style`:
  - Probe folder in the working tree: `packages/winglet/json/src/__bounty__/r4-json-style/`; the round copy is `bug-bounty/round-4/probes/winglet-json/r4-json-style/`.
  - To run the copy: copy it back to `packages/winglet/json/src/__bounty__/r4-json-style/` and run `yarn workspace @winglet/json test --run --config src/__bounty__/r4-json-style/vitest.config.ts src/__bounty__/r4-json-style/`.
  - The probe-local `vitest.config.ts` puts the `source` export condition first and aliases `@/common-utils`, so `@winglet/common-utils` loads from its source instead of the stale `dist` in the main tree.
  - Failing tests that are not findings: none.
  - Control tests that pass:
    - `contracts.r4.test.ts`: `SRC0` proves the source load. It reads the call stack from inside `cloneLite` during `mergePatch`, which shows `common-utils/src/`. Without the configuration it fails and shows `common-utils/dist/`.
    - `contracts.r4.test.ts`: `JM1d`, `JM1e` and `JC1c`.
    - `patchFuzz.r4.test.ts`: `JF1` and `JF2`, which are the differential hypotheses listed below.
  - Verification limits: the comparison of documents against code was done by hand on selected sections, because the delegated document review could not run.

Root-cause files: `packages/winglet/json/src/JSONPointer/utils/`

## 1. `mergePatch` writes an empty object `{}` for a new member whose value is `undefined`, so a member the caller left out appears in the result as an object.

- Severity: medium. A consumer that builds a merge patch in code from optional values, such as `mergePatch(user, { name, nickname })` with `nickname` undefined, silently stores `nickname: {}` where the document had no such member. Later code that expects a string or an absent member reads an object.
- Affected public API: `mergePatch`, from the package root and from `@winglet/json/pointer-patch`, with `immutable` true or false, at every depth.
- Contract violated:
  - `packages/winglet/json/src/JSONPointer/utils/patch/difference/DETAIL.md:20` states that a new member whose value is `undefined` is left out of a merge patch because adding it does not change the merge result.
  - `packages/winglet/json/src/JSONPointer/utils/patch/mergePatch/__tests__/mergePatchRecursive.test.ts:384` pins `undefined` as "excluded from the patch" for an existing member.
  - Predictability: the patches `{ nickname: undefined }` and `{}` serialize to the same JSON text, and RFC 7396 operates on JSON values ([RFC 7396](https://www.rfc-editor.org/rfc/rfc7396)), but they give different results.
- Root cause: `packages/winglet/json/src/JSONPointer/utils/patch/mergePatch/utils/mergePatchDeep.ts:70-71` computes `value === undefined ? (current === undefined ? {} : current) : value`.
  - For a member the target does not have, this writes `{}`.
  - The rule reproduces the earlier recursive implementation. That implementation called `mergePatchRecursive(source[key], value)`, whose default parameter `source = {}` and early return for an `undefined` patch produced `{}`.
- Relation to earlier rounds: New class: a value that JSON cannot carry (`undefined`) is treated differently from its absence. The closest earlier class is round 2 class 3, spelling variants of the same thing.
- Reopens an earlier fix: No.
  - `git log -L` on the root-cause lines shows `98a3ec973` ([round 2 item 7](../round-2/winglet-json.md), which moved the merge to explicit frames) and the formatting commit `4dcc761ad`.
  - The behavior already existed before `98a3ec973`, in `mergePatchRecursive.ts` at `98a3ec973^`.
- Reproduction: `contracts.r4.test.ts`, describe block "mergePatch: a member whose value is undefined".
  - `JM1`: `mergePatch({ name: 'a' }, { name: 'b', nickname: undefined })` returns `{ name: 'b', nickname: {} }`. Expected: `{ name: 'b' }`, the result of the same patch without the member.
  - `JM1b`: with `immutable: false`, the result is `{ name: 'a', nickname: {} }`. Expected: `{ name: 'a' }`.
  - `JM1c`: `mergePatch({ profile: { name: 'a' } }, { profile: { age: undefined } })` returns `{ profile: { name: 'a', age: {} } }`. Expected: `{ profile: { name: 'a' } }`.
  - The controls pass:
    - `JM1d`: an existing member set to `undefined` keeps its value.
    - `JM1e`: `difference` leaves out an `undefined` member, so its round trip has no extra member.
- Confidence: high; public API through the package source, with `@winglet/common-utils` loaded from source.

## 2. `setValue` below a primitive value throws a plain `TypeError` instead of the documented `JSONPointerError`.

- Severity: low. Code that identifies errors the way the specification instructs, by `name === 'JSONPointer'`, does not recognize this failure and handles it as an unexpected crash. The input, a write below a number, string or boolean, is an application mistake that the call should report in its documented form.
- Affected public API: `setValue`, from the package root and from `@winglet/json/pointer-manipulator`.
- Contract violated:
  - `packages/winglet/json/docs/en/SPECIFICATION.md:626` states that `getValue` and `setValue` throw `JSONPointerError`, identified by the name `'JSONPointer'`.
  - For the same situation, `applyPatch` reports the structured `PATCH_PATH_INVALID_INTERMEDIATE` error.
- Root cause:
  - `packages/winglet/json/src/JSONPointer/utils/manipulator/utils/setValueByPointer.ts:42` replaces only a `null` or `undefined` intermediate with a container.
  - `setValueByPointer.ts:52` then descends into the primitive.
  - The assignment at `setValueByPointer.ts:56-62` runs on that primitive and throws in strict mode.
- Relation to earlier rounds: Sibling of [round 2 item 2](../round-2/winglet-json.md), where the same `setValueByPointer` threw `Cannot create property 'b' on number '5'`; that time it was reached through `applyPatch` `move`.
- Reopens an earlier fix: No. `git log -L` on the root-cause lines shows no bug bounty commit; the newest are `fc7a40c7f` and `0c9f68cba`.
- Reproduction: `contracts.r4.test.ts`, `JS1`: `setValue({ a: 5 }, '/a/b', 1)` throws `TypeError: Cannot create property 'b' on number '5'`, whose `name` is `'TypeError'`. Expected: an error whose `name` is `'JSONPointer'`.
- Confidence: high; public API through the package source.

## 3. `convertJSONPointerToPath` drops empty reference tokens, so `'//x'` and `'/x'`, or `'/a//b'` and `'/a/b'`, convert to the same data path.

- Severity: low. A consumer that converts pointers to data paths, for example to match validator error paths, maps a member under the empty key to a different location. No consumer in the repository calls the function.
- Affected public API: `convertJSONPointerToPath`, from the package root, `@winglet/json/pointer` and `@winglet/json/pointer-common`.
- Contract violated:
  - RFC 6901 makes the empty string a valid reference token, so `'//x'` names member `x` under the key `''` ([RFC 6901 section 4](https://www.rfc-editor.org/rfc/rfc6901#section-4)).
  - Predictability: two pointers that `getValue` resolves to different values give the same path.
  - The JSDoc at `packages/winglet/json/src/JSONPointer/utils/convertJSONPointerToPath/convertJSONPointerToPath.ts:14` documents that `'/'` converts to `'.'`, so only empty tokens below the root are reported here.
- Root cause: `packages/winglet/json/src/JSONPointer/utils/convertJSONPointerToPath/convertJSONPointerToPath.ts:41` and `:54` append a segment only when it is longer than zero characters.
- Relation to earlier rounds: Confirms the open lead in [round 3](../round-3/winglet-json.md) ("Open leads"). It resembles the round 2 known limit for empty keys in `getJSONPath`, but `getJSONPath` keeps the key, while this function loses it.
- Reopens an earlier fix: No. `git log -L` shows only `d06713cbe`.
- Reproduction: `contracts.r4.test.ts`, describe block "convertJSONPointerToPath: empty reference tokens (round 3 open lead)".
  - `JC1`: both `'//x'` and `'/x'` give `'.x'`. Expected: different paths.
  - `JC1b`: both `'/a//b'` and `'/a/b'` give `'.a.b'`. Expected: different paths.
  - The control `JC1c` passes: on `{ '': { x: 1 }, x: 2 }`, `getValue` reads `1` at `'//x'` and `2` at `'/x'`.
- Confidence: high; public API through the package source.

## Hypotheses checked and not bugs

- From `r4-json-style`:
  - 4,000 seeded multi-operation patches in the default immutable mode match fast-json-patch 3.1.1, with `move` given to the reference as remove-then-add per RFC 6902 section 4.4 ([RFC 6902 section 4.4](https://www.rfc-editor.org/rfc/rfc6902#section-4.4)) (`JF1`).
    - The patches include root operations, deeply frozen sources, and patch values that are source subtrees or are shared between operations.
    - Each patch gives the same result applied at once and one operation at a time, and changes neither the source nor any patch value. Round 3's deferred root ownership holds.
  - The reference fast-json-patch resolves a `move` target before the removal and so accepts `move /0` to `/1` on a one-element array. The package resolves the target after the removal, which RFC 6902 section 4.4 and `applyPatch/DETAIL.md` require.
  - `compare` followed by `applyPatch`, in both `strict` settings, and `difference` followed by `mergePatch` round-trip on 3,000 seeded pairs each (`JF2`).
  - `isCircularMoveReference` compares escaped tokens correctly: `/a` is not a prefix of `/a~1b`.
  - `compilePointer` is exported from `@winglet/json/pointer-manipulator`, as `docs/en/SPECIFICATION.md:271` and the package skill state.
