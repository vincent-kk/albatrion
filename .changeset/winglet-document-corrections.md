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

`@winglet/data-loader`: The specification and the agent skill state what happens at runtime when `maxBatchSize` is given together with `disableBatch: true`: `disableBatch` wins and `maxBatchSize` is neither read nor validated. TypeScript rejects the combination.

`@winglet/react-utils`: The specifications and the agent skill now document the `ErrorBoundary` class (props `children`, `fallback`, `onError`) exported from the package root and `@winglet/react-utils/hoc`, and the agent skill names `useLazyConstant` as the hook that calls its initializer once, since `useConstant` stores a function without calling it.

`@winglet/data-loader`: The specifications now write error codes with their namespace, for example `DATA_LOADER.INVALID_KEY`, which is the value of the `code` property.
