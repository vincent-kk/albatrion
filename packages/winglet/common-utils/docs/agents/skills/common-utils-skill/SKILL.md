---
name: common-utils-skill
description: 'Knowledge for `@winglet/common-utils` — zero-dependency TypeScript utility library. Trigger on its sub-path imports (`@winglet/common-utils/array|object|filter|math|promise|scheduler|function|hash|lib`), on choosing between near-twin exports (equals/stableEquals, clone/cloneLite, difference/differenceLite, min/minLite, serialize*), and on debounce, throttle, getTrackableHandler, macrotask scheduling, deep clone/equality/merge semantics, or circular-reference safety.'
---

# @winglet/common-utils

Applies when the consuming project imports from `@winglet/common-utils` or one of its sub-paths. The library is wide but shallow — the risk is not API count, it is that many exports ship as near-identical name pairs whose contracts differ (`equals`/`stableEquals`, `clone`/`cloneLite`, `difference`/`differenceLite`). Picking the wrong twin type-checks cleanly and then fails at runtime, usually silently.

## Mental Model

- **One function, one module, re-exported by a category barrel.** `@winglet/common-utils/array` and the root barrel resolve to the same implementation; sub-paths exist for tree-shaking, not for behavior.
- **`Lite` is a suffix, not a concept.** It marks three unrelated things across the library — a small-array algorithm swap, a reduced type-coverage clone, and a scalar-arity overload — and in the first case the equality semantics change too.
- **Degenerate return over throw.** Bad input yields `0`, `[array]`, `Infinity`, `NaN`, or `undefined` rather than an error. `factorial` and `fibonacci` are the only exports that throw on invalid input.
- **Circular-reference safety is per function, not per library.** `clone` is safe and `cloneLite` overflows the stack; `stableEquals` is safe and `equals` overflows. Each pair sits side by side in the same barrel.
- **Scheduler bindings resolve once, at module load.** `scheduleMacrotask` and its siblings pick an implementation off `globalThis` when the module is first imported, so globals patched afterwards — fake timers, for instance — are not intercepted.

## Decision Guide

| Question                                                | Answer                                                                                      |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Deep equality, data may be circular?                    | `stableEquals` — `equals` overflows the stack                                               |
| Deep equality, plain data, hot path?                    | `equals`; its third argument is a key set to omit from every level                          |
| Deep clone with `Date`/`Map`/`Set`/`RegExp`/TypedArray? | `clone`                                                                                     |
| Deep clone of JSON-shaped data only?                    | `cloneLite` — anything else passes through **by reference**                                 |
| Copy one level?                                         | `shallowClone`                                                                              |
| Set operations on fewer than ~100 elements?             | `differenceLite` / `intersectionLite` — but they compare with `===`, so `NaN` never matches |
| Merge two key lists while preserving a priority order?  | `orderedMerge(preferred, source)`                                                           |
| Schedule work and the browser must stay responsive?     | `scheduleMacrotaskSafe` — `setTimeout`, so the browser paints between tasks                 |
| Schedule work at minimum latency?                       | `scheduleMacrotask` — MessageChannel, no `setTimeout` clamp, no guaranteed paint            |
| Track an async call's pending state for UI?             | `getTrackableHandler` — the property is `.pending`, never `.loading`                        |
| Rate-limit a handler?                                   | `throttle` fires _during_ activity; `debounce` fires _after_ it stops                       |

## Invariants & Gotchas

- **`merge` mutates `target`, and merges arrays index-wise rather than by concatenation.** `merge({a:[1,2]},{a:[3]})` yields `{a:[3,2]}` — the target's surplus elements survive. Clone first when the caller owns `target`.
- **`debounce` and `throttle` discard the wrapped function's return value** — both are declared to return `void`. `.execute()` clears the stored arguments, so calling it twice in a row runs the function once.
- **An aborted `signal` permanently neuters a debounced or throttled function.** Every later call returns early; there is no way to re-arm it.
- **`getTrackableHandler` blocks concurrent calls by default** (`preventConcurrent: true`), and the blocked call resolves `undefined` cast as `Result` — a silent type hole at the call site.
- **`.pending`, `.state`, and `.subscribe` are non-enumerable**, so they disappear from `{...handler}` and `Object.keys`. A trackable handler has no `.execute()`, `.clear()`, or `onError` — those belong to `debounce`/`throttle`.
- **`clone(target, maxDepth)` returns nodes at or beyond `maxDepth` by reference**, so a depth-bounded clone silently shares mutable state with its original.
- Before trusting a remembered signature, check `knowledge/corrections.md` — the package README contains four errors that agents reproduce verbatim.

## Knowledge Router

| Topic                                                                                                                                                                                                                                                | File                       |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| Near-twin selection tables, circular-safety matrix, mutation and identity contracts, event-loop and scheduling model, rate-limiting modes, the `getTrackableHandler` contract, surprising predicates, and performance figures absent from signatures | `knowledge/semantics.md`   |
| Flat wrong-to-right list for names, signatures, and behaviors that are commonly misremembered, including the four README errors                                                                                                                      | `knowledge/corrections.md` |

## API Truth

Signatures, parameter names, generics, and the complete export list are mechanical facts — **read them, do not recall them.** In a consuming project they live at `node_modules/@winglet/common-utils/dist/**/*.d.ts`, with prose in that package's `README.md`. The two knowledge files above deliberately cover only what those sources cannot tell you.

Sub-path map; every path is also reachable through the root barrel:

| Sub-path                | Topic                                                                                      |
| ----------------------- | ------------------------------------------------------------------------------------------ |
| `@winglet/common-utils` | everything (root barrel)                                                                   |
| `/array`                | ordering, dedup, set operations, iteration helpers                                         |
| `/object`               | clone, deep equality, merge, serialization, key and value transforms                       |
| `/filter`               | ~40 type guards and emptiness predicates                                                   |
| `/math`                 | arithmetic, statistics, number theory, base conversion                                     |
| `/promise`              | `delay`, `timeout`, `withTimeout`, wait-and-\* — all `AbortSignal`-aware                   |
| `/scheduler`            | microtask, next-tick, and macrotask scheduling; `MessageChannelScheduler`                  |
| `/function`             | `debounce`, `throttle`, `getTrackableHandler`                                              |
| `/hash`                 | `Murmur3`, `polynomialHash`                                                                |
| `/convert`              | `convertMsFromDuration`                                                                    |
| `/console`              | `printError`, `printWarning`                                                               |
| `/error`                | `BaseError` plus `AbortError` / `InvalidTypeError` / `TimeoutError` and their `is*` guards |
| `/constant`             | time, SI and binary unit, type-tag, and no-op function constants                           |
| `/lib`                  | cache factories, counter, key and type helpers, random generators                          |
