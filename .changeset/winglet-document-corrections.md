---
"@winglet/common-utils": patch
"@winglet/json": patch
"@winglet/json-schema": patch
"@winglet/data-loader": patch
"@winglet/react-utils": patch
"@winglet/style-utils": patch
---

The specifications, READMEs and packaged agent skills now match current behavior. Notable corrections: `applyPatch` copies only the containers on each written path and shares the rest with the source and the patch; reserved keys such as `__proto__` are written as ordinary own data in every `@winglet/json` function; `useHandle`, `useOnUnmount` and `useSnapshotReference` publish at commit; `equals` and `cloneLite` throw `RangeError` on a cycle; `maxBatchSize` must be a positive integer or `Infinity`; `merge` merges arrays by index; `waitAndExecute` and `waitAndReturn` take the function first. The English and Korean specifications of `@winglet/common-utils` and `@winglet/react-utils` now have the same sections.

`@winglet/react-utils`: The specification and the `useHandle` reference now state that a call made during the first render runs that render's own handler, because no handler is committed yet.

`@winglet/data-loader`: The specification and the agent skill no longer say TypeScript rejects `maxBatchSize` together with `disableBatch`: both are accepted and `disableBatch` wins.
