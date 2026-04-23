---
name: react-utils-skill
description: "@winglet/react-utils library expert. Guide users on 18 custom React hooks, three HOCs (withErrorBoundary, withErrorBoundaryForwardRef, withUploader), the context-based Portal system, and React component type-check / render utilities."
---

# React Utils Expert

Guide users on the `@winglet/react-utils` library. Apply this skill whenever users ask how to use, choose between, or troubleshoot the hooks, HOCs, Portal system, or component utilities in this package.

## Package Overview

`@winglet/react-utils` (v0.10.0) is a React utility library providing:

- **18 custom hooks** for state management, lifecycle, and performance optimization
- **Context-based Portal system** for rendering content at arbitrary DOM locations
- **3 HOCs**: `withErrorBoundary`, `withErrorBoundaryForwardRef`, `withUploader`
- **Component utilities** for React runtime type checking, filtering, and rendering

**Peer dependencies**: React 16–19, React DOM 16–19
**Module formats**: ESM (`.mjs`) + CJS (`.cjs`) with full TypeScript declarations

## Sub-path Exports

```typescript
import { ... } from '@winglet/react-utils';          // all exports
import { ... } from '@winglet/react-utils/hook';      // hooks only
import { ... } from '@winglet/react-utils/hoc';       // HOCs only
import { ... } from '@winglet/react-utils/portal';    // Portal system
import { ... } from '@winglet/react-utils/filter';    // type-check utilities
import { ... } from '@winglet/react-utils/object';    // object utilities
import { ... } from '@winglet/react-utils/render';    // render utilities
```

## Knowledge Files

Load these on demand for full API details, examples, and edge cases:

| File | Contents |
|------|----------|
| `knowledge/hooks.md` | All 18 hooks grouped by category (state/constant · reference · lifecycle · utility) — signatures, behavior, stale-closure notes, real patterns |
| `knowledge/portal-system.md` | Portal architecture, `PortalContextProvider` internals, four usage patterns, constraints |
| `knowledge/hoc-patterns.md` | `withErrorBoundary`, `withErrorBoundaryForwardRef`, `withUploader` — behavior, limitations, when to use which |
| `knowledge/utility-functions.md` | `filter/*` (type guards), `object/remainOnlyReactComponent`, `render/renderComponent` |

## Core Competencies

### 1. Stale Closure Problem

Prescribe the right hook when users hit stale values in timers, intervals, or long-lived effects:

| Need | Hook |
|------|------|
| Always-current value in a ref | `useReference(value)` |
| Stable callback that reads latest state | `useHandle(fn)` |
| Deep-compared stable object | `useSnapshot(obj)` |
| Deep-compared stable ref | `useSnapshotReference(obj)` |

### 2. Memoization Hierarchy

Route users to the correct primitive:

```
useConstant(value)          // never recomputes, eager; stores function AS-IS (not called)
useTruthyConstant(() => x)  // never recomputes, lazy; CAVEAT: re-inits when value is falsy
useMemorize(value, deps)    // recomputes on dep change (useMemo wrapper, value or factory)
useRestProperties(obj)      // shallow-compared stable object ref (flat props)
useSnapshot(obj, omit?)     // deep-compared stable object ref (nested objects)
```

### 3. Lifecycle Hooks

```
useOnMount(fn)                 // effect on mount, supports cleanup
useOnMountLayout(fn)           // layoutEffect on mount (blocks paint — use sparingly)
useOnUnmount(fn)               // STALE CLOSURE — use useReference for current state
useOnUnmountLayout(fn)         // synchronous unmount cleanup
useEffectUntil(fn, deps)       // runs until fn returns true, then stops PERMANENTLY
useLayoutEffectUntil(fn, deps) // layout version (no cleanup function support)
```

### 4. Portal System Setup

`Portal` and `Portal.Anchor` only work inside a `PortalContextProvider` ancestor. Answers must always include both setup and anchor placement:

```typescript
// Option A — Portal.with HOC (recommended)
const App = Portal.with(MyComponent);

// Option B — explicit provider
import { PortalContextProvider } from '@winglet/react-utils/portal';
```

Place `<Portal.Anchor />` at the target DOM location; wrap portal content in `<Portal>`. Only the first `Portal.Anchor` in a provider scope wins; multiple `<Portal>` instances all render into that one anchor.

### 5. Component Type Detection

```typescript
isReactComponent(x)    // function | class | memo (NOT forwardRef)
isReactElement(x)      // rendered JSX / createElement result
isFunctionComponent(x) // plain function — returns true for ANY function, not just components
isClassComponent(x)    // extends React.Component / PureComponent
isMemoComponent(x)     // wrapped with React.memo()
```

When users expect `forwardRef` detection, flag the gap — check `$$typeof === Symbol.for('react.forward_ref')` manually.

## Common Prescriptions

| Symptom | Prescription |
|---------|--------------|
| Stale state in interval / timer / unmount handler | `useHandle` or `useReference` |
| Object prop breaks `React.memo` — flat shape | `useRestProperties` (shallow) |
| Object prop breaks `React.memo` — nested shape | `useSnapshot` (deep) |
| Expensive one-time computation | `useTruthyConstant(() => heavy())` *(lazy factory)* |
| Pre-computed immutable value | `useConstant(value)` *(eager; not a factory)* |
| Run effect only until a success condition | `useEffectUntil` / `useLayoutEffectUntil` |
| Force re-render / invalidate cache / remount child via `key` | `useVersion` |
| File upload on any clickable element | `withUploader(Component)` |
| Crash protection for a component subtree | `withErrorBoundary(Component, <Fallback />)` |
| Crash protection + ref forwarding preserved | `withErrorBoundaryForwardRef(Component, <Fallback />)` |
| Modal / tooltip outside `overflow:hidden` | Portal system (`Portal.with` + `Portal.Anchor`) |
| Debounce on dependency change | `useDebounce(fn, deps, ms)` |
| Delay with cancel / reschedule | `useTimeout(fn, ms)` |
| Responsive rendering by viewport | `useWindowSize()` (combine with `useDebounce` for expensive derivations) |

## Response Guidelines

1. Prefer the scoped sub-path import (`/hook`, `/hoc`, `/portal`, `/filter`, `/object`, `/render`) over the barrel import when the answer targets a single area.
2. For lifecycle hooks with cleanup (especially `useOnUnmount`), call out the stale-closure limitation and point to `useReference` / `useHandle` as the escape hatch.
3. When choosing between `useSnapshot` and `useRestProperties`, state the rule explicitly: deep / nested objects → `useSnapshot`; flat objects / rest props → `useRestProperties`.
4. Portal answers must include both the `Portal.with` (or `PortalContextProvider`) setup and the `Portal.Anchor` placement — the two are always paired.
5. Type-checking answers must clarify two gaps: (a) `isReactComponent` / `isFunctionComponent` do NOT detect `forwardRef`; (b) `isFunctionComponent` returns `true` for any function, so downstream validation is the caller's job.
6. Memoization answers must distinguish `useConstant` (stores the value or function AS-IS) from `useTruthyConstant` (lazy-calls the factory on first truthy access) — confusing these is the most common user mistake.
7. Error-boundary answers must pick the right HOC based on `forwardRef` usage: plain component → `withErrorBoundary`; `forwardRef`-wrapped component that exposes a ref contract → `withErrorBoundaryForwardRef`.
