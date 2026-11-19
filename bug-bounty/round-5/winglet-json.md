# @winglet/json: bug bounty round 5

2 new findings in `@winglet/json`, both low. Items in the documents of [round 1](../round-1/winglet-json.md), [round 2](../round-2/winglet-json.md), [round 3](../round-3/winglet-json.md) and [round 4](../round-4/winglet-json.md) were treated as fixed and excluded, together with the decisions and known limits of each round's `FIXES.md`. The main session re-ran every probe: the `r5-winglet-data` folder ran 7 tests, of which 3 fail. No item is a regression or a watch-list repeat.

Probes: [probes/winglet-json/](probes/winglet-json/)

- Copy a folder back to `packages/winglet/json/src/__bounty__/<hunter-id>/` and run `yarn workspace @winglet/json test --run src/__bounty__/<hunter-id>/`. The probes import the package source through the `@/json` alias; `@winglet/common-utils` resolves to its `dist`.
- Every failing test belongs to an item below; the `immutable: false` row and the `mergePatch` control pass.
- Earlier probes re-run (`r5-rerun-others`): round 1 ran 37 tests (3 fail), round 2 30 (6 fail), round 3 254 with 3 skipped (9 fail), and round 4, with its own configuration, 12 (0 fail). Every failure has a recorded role: round 1 documentation-only and known-limit decisions (items 7a and 7b), round 2 item 6 documentation fixes and item 8b's decision, listed round 2 diagnostics, a listed round 3 diagnostic, and eight round 3 `ca1-docs` assertions of text that the item 2 documentation fix (`7ae55dd3d`) changed. No earlier item regressed.

Root-cause files: `packages/winglet/json/src/`

## 1. In its default immutable mode, `applyPatch` turns a prototype-free dictionary into an ordinary object at the root and at every container it writes, while mutable mode and `mergePatch` keep the null prototype.

- Severity: low. It needs an `Object.create(null)` source, which the `JSONObject` type (`Record<string, any>`) accepts. In the immutable default and on written paths only, a lookup such as `result.users['constructor']` returns a function instead of `undefined`.
- Affected public API: `applyPatch` (the package root and `@winglet/json/pointer-patch`).
- Contract violated: `src/JSONPointer/utils/patch/applyPatch/DETAIL.md:6` (for any combination of patch input and options, the prototype of the returned document is not replaced); predictability: `{ immutable: false }` and `mergePatch` keep `null` for the same input.
- Root cause: the copy-on-write copies use object spread, which always creates an object whose prototype is `Object.prototype`: `src/JSONPointer/utils/patch/applyPatch/applyPatch.ts:102` and `:118`, `applySinglePatch.ts:208` and `utils/resolveFromParent.ts:59`.
- Relation to earlier rounds: round 4 `@winglet/common-utils` item 6 and round 4 class 37 (inherited prototype members read as data); the common-utils case is [winglet-common-utils item 4](winglet-common-utils.md).
- Reopens an earlier fix: no; `git log -L` shows only `0c9f68cba`, `d8fac9049`, `e91b08316` and `fc7a40c7f`.
- Regression of an earlier fix: no.
- Watch list: no. The copies are the ones the root ownership of `applyPatch` uses, but the class is prototype loss, not a bypassed immutability guarantee.
- Reproduction: `r5-winglet-data/pointerAndPatch.r5.test.ts`, "immutable=true: the result root and the written container keep a null prototype": `{ root: 'Object.prototype', users: 'Object.prototype', constructorLookup: 'function' }`, expected `null`, `null` and `'undefined'`.
- Confidence: high; public API from source.

## 2. `convertJSONPathToPointer` drops the empty tokens that `convertJSONPointerToPath` now keeps, so the documented inverse pair turns `//x` into `/x` and `/a//b` into `/a/b`.

- Severity: low. It needs a member named with the empty string, which is exactly the input the round 4 fix covered in the other direction; code that converts a pointer to a data path and back then reads or writes a different member.
- Affected public API: `convertJSONPathToPointer` together with `convertJSONPointerToPath`.
- Contract violated: `docs/agents/skills/json-skill/knowledge/pointers-and-paths.md:108-116`, which calls the two functions an inverse pair and excludes only data paths with `$`, quoted keys or `~`; the round 4 decision that empty tokens stay distinct (`../round-4/FIXES.md:310` and `:408`).
- Root cause: `src/JSONPath/utils/convertJSONPathToPointer/convertJSONPathToPointer.ts:34`, `:42` (`if (index > start)`) and `:66` emit a segment only when it is not empty.
- Relation to earlier rounds: round 4 item 3, whose fix (`a73864fb0`) changed only the other direction; round 3 class 21 (a fix that left a case out).
- Reopens an earlier fix: no; `git log -L 15,77` shows only `92b21bec7`, `ebc8a0471`, `3cc2316a1` and `d06713cbe`.
- Regression of an earlier fix: no; before `a73864fb0` the round trip also ended at `/x`.
- Watch list: no.
- Reproduction: `r5-winglet-data/pointerAndPatch.r5.test.ts`: "//x round-trips to a pointer that reads the same value" gives `{ path: '..x', back: '/x', value: 2 }`, expected `back` `'//x'` and `value` 1; "/a//b round-trips…" gives `back: '/a/b'` and `value: 4`, expected `'/a//b'` and 3. The control passes.
- Confidence: high for the behavior; medium for the classification.

## Hypotheses checked and not bugs

- `applyPatch` in immutable mode agrees with mutable mode, and mutable mode applied all at once agrees with one operation at a time: values and error codes match on 4,000 seeded documents and patch lists, including root operations and empty or escaped keys.
- `mergePatch` keeps the null prototype of a prototype-free source.
- The handling of `undefined` in `compare` and `difference` is documented.
