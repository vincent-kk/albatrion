# @winglet/react-utils: bug bounty round 5

2 new findings in `@winglet/react-utils`, both low. Items in the documents of [round 1](../round-1/winglet-react-utils.md), [round 2](../round-2/winglet-react-utils.md), [round 3](../round-3/winglet-react-utils.md) and [round 4](../round-4/winglet-react-utils.md) were treated as fixed and excluded, together with the decisions and known limits of each round's `FIXES.md`. The main session re-ran every probe: the `r5-style-react-modal` folder ran 2 tests, of which 1 fails, and the `r5-release` folder ran 6 tests, of which 3 fail. No item is a regression or a watch-list repeat. [Item 6 of canard-schema-form.md](canard-schema-form.md) also affects this package's root declarations (4 occurrences).

Probes: [probes/winglet-react-utils/](probes/winglet-react-utils/)

- Copy a folder back to `packages/winglet/react-utils/src/__bounty__/<hunter-id>/` and run `yarn workspace @winglet/react-utils test --run src/__bounty__/<hunter-id>/`; add `--testTimeout=120000` for `r5-release`, the per-test timeout the CI runner uses. `r5-release` imports the built `dist` by name.
- Every failing test belongs to an item below. The guide-text test `K0` passes, confirming that the guide still contains the sentence of item 2; item 1's CommonJS and React 18 controls pass.
- Earlier probes re-run (`r5-rerun-others`): round 1 ran 2 tests (1 fail), round 2 7 (2 fail), round 3 11 (0 fail), and round 4, with its own configuration, 19 (5 fail), plus a passing type probe; the earlier release probes `r3-contracts` ran 1 (1 fail) and `r4-contracts` 5 (1 fail). Every failure is an assertion of behavior or text that a recorded documentation fix changed (round 1 item 1 on `useOnUnmount`, round 2 items 3 and 4, round 3 item 4, round 4 items 2 and 3). No earlier item regressed.

Root-cause files: `packages/winglet/react-utils/`

## 1. The ESM build cannot be resolved by Node ESM or webpack 5 when the host has React 16.14 or 17, which the peer range admits, because every JSX-bearing `.mjs` imports the extensionless `react/jsx-runtime`.

- Severity: low. A packaging failure confined to React 16.14 and 17 hosts that use a strict ESM resolver: such an application fails at build or start with "Can't resolve 'react/jsx-runtime'" as soon as it imports the package, when it is built with webpack 5 (which treats `.mjs` and `"type": "module"` packages as fully specified) or rendered with Node's native ESM. Round 2 rated the neighboring peer-floor item low.
- Affected public API: every ESM entry that reaches JSX (the root, `./hoc`, `./portal` and others; eight `.mjs` files import `react/jsx-runtime`).
- Contract violated: `package.json:227-228` (`react` and `react-dom` `>=16.14 <20`); `documents/docs/winglet/react-utils/index.mdx:14` ("Supports React 16.14–19"); `docs/agents/skills/react-utils-skill/SKILL.md:85` (the same peer range, shipping ESM and CommonJS).
- Root cause: `"jsx": "react-jsx"` in `tsconfig.base.json:12` makes the build emit `import { jsx } from "react/jsx-runtime"` (for example `dist/hoc/withErrorBoundary/withErrorBoundary.mjs:2`). React 16.14.0 and 17.0.2 publish no `exports` map, so a strict ESM resolver cannot add the `.js` extension; React 18 adds `exports['./jsx-runtime']`. The CommonJS build resolves, because `require` adds extensions.
- Relation to earlier rounds: round 2 item 5 (the peer floor against the JSX runtime) and round 4 class 40.
- Reopens an earlier fix: round 2 item 5 (`86fba5987`), which raised the floor to 16.14 for the JSX runtime but did not address ESM resolution of it; its decision stands.
- Regression of an earlier fix: no.
- Watch list: no.
- Reproduction: `r5-release/react17EsmJsxRuntime.test.ts` places a copy of the built `dist` with `publishConfig.exports` and a `react` with the 17.0.2 manifest shape under `os.tmpdir()`: "Node ESM imports the hoc subpath with a React 17 manifest" gives `ERR_MODULE_NOT_FOUND … node_modules/react/jsx-runtime imported from …/FallbackMessage.mjs`, expected `loaded`; "webpack 5 bundles the hoc subpath with a React 17 manifest" (webpack 5.105.1) gives "Module not found: Error: Can't resolve 'react/jsx-runtime'", expected `bundled`. The controls pass: the CommonJS build with the same manifest, and Node ESM and webpack with a React 18-shaped manifest.
- Confidence: high; built `dist`.

## 2. The packaged guide still says that `useSnapshotReference(...).current` equals `useSnapshot(...)`, but since the round 4 commit-time change, `.current` read during an update render is the previous snapshot, so code that follows the guide renders stale data.

- Severity: low (packaged agent knowledge that a fix did not update). An agent or developer who follows the guide and reads `useSnapshotReference(data).current` in render shows the previous committed value after an update.
- Affected public API: `useSnapshotReference` and `useSnapshot` (`@winglet/react-utils/hook`), and the packaged skill.
- Contract violated: `.changeset/committed-snapshot-references.md` (a major entry that tells consumers to use `useSnapshot` for render values); the `@remarks` of the `useSnapshotReference` JSDoc and the Notes of `documents/docs/winglet/react-utils/hook/useSnapshotReference.mdx`; `DOCUMENTATION.md` principles 3 and 6.
- Root cause: `docs/agents/skills/react-utils-skill/knowledge/hooks.md:48`, which the round 4 item 2 fix (`b33cc58aa`, `7f7401166`, `110d69156`, `1161eab74`, `6b2dfd083`) did not update; `git log -L 48,48` shows only `981a92af8` and `f91922be9`.
- Relation to earlier rounds: round 4 class 39 (round 4 items 3 and 5).
- Reopens an earlier fix: no.
- Regression of an earlier fix: no.
- Watch list: no.
- Reproduction: two hunters reproduced it independently. `r5-style-react-modal/snapshotDocs.r5.test.tsx`, `K1`, gives `{ viaSnapshot: 'second', viaReference: 'first' }`, expected both `'second'`; `r5-release/snapshotReferenceGuide.test.tsx`, "as the guide states, .current of useSnapshotReference equals useSnapshot in the same render", gives `{ snapshot: 'second', reference: 'first' }` against the built `dist`.
- Confidence: high; public API from source and from the built `dist`.

## Hypotheses checked and not bugs

- `useTimeout` keeps its mounted flag in an insertion effect that StrictMode and an `<Activity>` reveal do not disconnect (static); the `Portal.Anchor` null-detach design was reviewed statically; `useRestProperties` handles an own `undefined` key.
- The React APIs the `dist` uses fit the peer floor, and `useInsertionEffect` is guarded.
