---
name: react-utils-skill
description: '@winglet/react-utils expert — 19 React hooks (useConstant / useLazyConstant / useTruthyConstant / useMemorize, useHandle, useReference, useSnapshot, useEffectUntil, useDebounce, useWindowSize), the context-based Portal system, error-boundary and uploader HOCs, and React runtime type-check / render utilities.'
user-invocable: false
---

# @winglet/react-utils — identity-stability primitives for React

Applies when choosing between this package's hooks, wiring its Portal system, or explaining why one of its utilities silently returned the wrong thing. What follows is only what the type declarations cannot show — including several behaviors that contradict the package's own JSDoc examples.

## Mental Model

**Almost every hook here exists to freeze a reference, not to compute a value.** `useMemo` promises "probably still cached"; the constant hooks here promise "never recomputed". Choose by what breaks when the value is recreated: wasted work → plain memoization is enough; a dropped subscription, a lost store, a remounted subtree → you need the guarantee.

**The constant family splits on two questions the names do not answer:**

| Hook                    | A function argument is…        | Can it run again?                         |
| ----------------------- | ------------------------------ | ----------------------------------------- |
| `useConstant(x)`        | **stored as-is, never called** | no                                        |
| `useLazyConstant(fn)`   | called once, on first render   | no — guaranteed, not a hint               |
| `useTruthyConstant(fn)` | called on first render         | **yes — on any render where it is falsy** |
| `useMemorize(x, deps)`  | **called**                     | yes, when `deps` change                   |

`useConstant` and `useMemorize` accept the same argument shape and do the opposite thing with it. Confusing that pair is the most common defect in this package's usage.

**The Portal system inverts ownership.** `<Portal>` renders `null` where you write it and registers its children into context; the provider renders every registration through `createPortal` into a single anchor ref that all `Portal.Anchor` instances share. Where content lands is a property of the provider, never of the `<Portal>` call site.

## Decision Guide

| Need                                                                                       | Use                                                                                    |
| ------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------- |
| Value whose recreation would be a correctness bug (store, manager, emitter, context value) | `useLazyConstant(() => create())`                                                      |
| Pre-computed immutable value, or a function you want held, not run                         | `useConstant(value)`                                                                   |
| Expensive lazy computation whose result is always truthy                                   | `useTruthyConstant(() => heavy())`                                                     |
| Recompute when dependencies change                                                         | `useMemorize(fn, deps)`                                                                |
| Always-current value inside a timer, interval, or long-lived effect                        | `useReference(value)`                                                                  |
| Callback with permanent identity that still reads latest state                             | `useHandle(fn)`                                                                        |
| Flat object prop defeating `React.memo`                                                    | `useRestProperties(props)` — shallow                                                   |
| Nested object prop defeating `React.memo`                                                  | `useSnapshot(obj, omit?)` — deep                                                       |
| Effect that must stop permanently once it succeeds                                         | `useEffectUntil(fn, deps)` (`useLayoutEffectUntil` before paint)                       |
| Force a re-render or remount a child through `key`                                         | `useVersion()`                                                                         |
| Render outside `overflow: hidden` or a stacking context                                    | `Portal.with(Component)` + `<Portal.Anchor />`                                         |
| Crash isolation for a subtree                                                              | `withErrorBoundary` — `withErrorBoundaryForwardRef` when the component is `forwardRef` |
| Turn any clickable element into a file picker                                              | `withUploader(Component)`                                                              |
| Render a prop that may be a component, a ready element, or absent                          | `renderComponent(x, props)` — but strings and numbers become `null`                    |
| Identify what a value is at runtime                                                        | `filter` guards — read their blind spots before trusting one                           |
| Keep only the components in a mixed registry                                               | `remainOnlyReactComponent(dict)` — inherits both guard defects                         |

## Invariants & Gotchas

- **`useConstant(() => heavy())` never calls the function** — it stores it. The package's own JSDoc presents exactly this call as an "expensive computation that runs only once", contradicting its `@param` line one screen below. Symptom: consumers receive a function where they expected data. Use `useLazyConstant` or `useTruthyConstant` to actually run a factory.
- **`useMemorize(() => x)` does call it**, being the mirror image of the rule above. Same argument shape, opposite semantics.
- **`useTruthyConstant` re-runs its factory on every render where the held value is falsy.** Unusable when `null`, `0`, `''`, or `false` is a legitimate result — that is what `useLazyConstant` is for.
- **`useHandle(undefined)` still returns a callable**, which returns `null` at runtime while typed as the handler's return type. It never throws, so a missing handler surfaces as a downstream `null`, not as an error at the call site.
- **`useOnUnmount(fn)` captures `fn` at mount.** Component state read inside it yields mount-time values; route through `useReference` for current state. The same applies to `useOnUnmountLayout`.
- **`isReactComponent` does not detect `forwardRef`, and `isFunctionComponent` returns `true` for any function.** `remainOnlyReactComponent` inherits both: it silently drops `forwardRef` components and keeps unrelated functions. Detect `forwardRef` manually with `$$typeof === Symbol.for('react.forward_ref')`.
- **`@winglet/react-utils/portal` exports exactly one value: `Portal`.** `PortalContextProvider` and `withPortal` are not public values, so `Portal.with(Component)` is the only supported setup — any answer importing the provider directly does not compile. Setup and `<Portal.Anchor />` placement are always answered together; neither works alone.
- **With several anchors in one provider scope, the LAST one to mount wins** — every anchor writes to the same shared ref, so each mount overwrites the previous. One anchor per scope is the only predictable arrangement.
- **A `style` prop on `Portal.Anchor` replaces `display: contents` outright** rather than merging with it, silently turning the anchor into a layout-participating block.
- **`useDebounce` defaults to `immediate: true`** — it fires on the leading edge, and its options are frozen at first render.
- **`useWindowSize()` returns `{ width: 0, height: 0 }` on the first render**, including every server render. Branch on it and the SSR and client markup diverge.
- **Pick the error-boundary HOC by `forwardRef` usage**, not by preference: `withErrorBoundaryForwardRef` exists because `withErrorBoundary` drops the ref contract.

## Knowledge Router

| Topic                                                                                     | File                                    |
| ----------------------------------------------------------------------------------------- | --------------------------------------- |
| Hook traps and selection rules — constant family, identity stabilizers, lifecycle, timing | `knowledge/hooks.md`                    |
| Portal architecture, anchor constraints, setup pattern                                    | `knowledge/portal-system.md`            |
| HOC selection, error-boundary gaps, `withUploader`, type guards, `renderComponent`        | `knowledge/components-and-utilities.md` |

## API Truth

Signatures, option names, and defaults come from `node_modules/@winglet/react-utils/dist/**/*.d.ts` and the README — read them rather than guessing. Prefer the scoped sub-path over the barrel when an answer targets one area:

```typescript
import { useHandle } from '@winglet/react-utils/hook';      // 19 hooks
import { Portal } from '@winglet/react-utils/portal';       // Portal, incl. Portal.with / Portal.Anchor — nothing else
import { withErrorBoundary } from '@winglet/react-utils/hoc'; // + withErrorBoundaryForwardRef, withUploader
import { isReactComponent } from '@winglet/react-utils/filter'; // + isReactElement, isFunctionComponent, isClassComponent, isMemoComponent
import { remainOnlyReactComponent } from '@winglet/react-utils/object';
import { renderComponent } from '@winglet/react-utils/render';
import { useHandle } from '@winglet/react-utils';           // barrel — everything above
```

Peer dependencies: React and React DOM `>=16 <20`. Ships ESM (`.mjs`) and CJS (`.cjs`) with declarations.
