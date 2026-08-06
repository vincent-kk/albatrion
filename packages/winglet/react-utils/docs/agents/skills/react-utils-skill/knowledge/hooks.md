# Hooks — traps and selection rules

Nineteen hooks, grouped by the decision they belong to. Signatures live in `dist/hooks/*.d.ts`; what follows is only the behavior those declarations cannot express.

## The constant family

Four hooks accept "a value or a factory" and disagree about what that means.

| Hook                    | Function argument              | Re-runs?                                  | Reach for it when                                             |
| ----------------------- | ------------------------------ | ----------------------------------------- | ------------------------------------------------------------- |
| `useConstant(x)`        | **stored as-is, never called** | never                                     | the value is already computed, or you want to hold a function |
| `useLazyConstant(fn)`   | called once, on first render   | never — guaranteed                        | re-running the factory would be a correctness bug             |
| `useTruthyConstant(fn)` | called on first render         | **whenever the held value is falsy**      | an expensive computation whose result is always truthy        |
| `useMemorize(x, deps)`  | **called**                     | when `deps` change (default `[]` — never) | you want `useMemo` with a value-or-factory argument           |

### `useConstant` stores functions; `useMemorize` calls them

The two take the same argument shape and do the opposite thing with it. `useConstant` is `useRef(input).current` — the input is never invoked. `useMemorize` is `useMemo(() => isFunction(input) ? input() : input, deps)` — a function input is invoked.

```tsx
const stored = useConstant(() => compute()); // a function; compute() never runs
const result = useMemorize(() => compute()); // compute()'s return value, computed once
```

The trap is well disguised: `useConstant`'s shipped JSDoc offers `useConstant(() => { ... })` as its "expensive computation that runs only once" example, while its own `@param` line — one screen further down — states that a function is stored as-is, not executed. **The `@param` line is correct and the example is wrong.** That JSDoc ships inside `dist/*.d.ts`, so editor hover repeats the mistake. Symptom when it bites: a child receives a function where it expected data, and nothing throws.

### `useTruthyConstant` re-initializes on falsy

It holds the value in a ref guarded by `if (!ref.current)`, so any render that finds the held value falsy runs the factory again. It cannot hold `null`, `0`, `''`, or `false` — a feature-detection factory returning `null` re-detects on every single render.

### `useLazyConstant` is a guarantee, not a hint

It is `useState(factory)[0]`: the factory runs on the initial render and the result lives in React state, which React never discards. `useMemo` explicitly reserves the right to drop its cache and recompute, so it is a performance hint. When re-running the factory would break correctness — a manager, an observer, a store, an emitter whose identity consumers close over — this is the only one of the four that promises it will not happen. It also runs exactly once for a falsy result, unlike `useTruthyConstant`.

In StrictMode (development) React double-renders and may invoke the factory twice, committing only one result. Keep factories free of external side effects; allocate real resources lazily inside the produced instance.

## Identity stabilizers

`useReference`, `useHandle`, `useSnapshot`, `useRestProperties`, and `useSnapshotReference` all exist to stop a reference from changing.

| Problem                                                               | Hook                                                               |
| --------------------------------------------------------------------- | ------------------------------------------------------------------ |
| Value read inside a timer, interval, or long-lived effect is stale    | `useReference(value)` → a ref updated every render                 |
| Callback identity must never change, but must call the latest handler | `useHandle(fn)`                                                    |
| Flat object prop defeats `React.memo`                                 | `useRestProperties(props)` — shallow comparison                    |
| Nested object prop defeats `React.memo`                               | `useSnapshot(obj, omit?)` — deep comparison, optional key omission |

`useSnapshotReference` is `useSnapshot` before the `.current` read — take it only when you need the ref object itself rather than its value.

**`useSnapshot`'s `omit` set is captured on the first render and never re-read.** A dynamically computed omit list silently keeps using its initial value for the component's whole life, so keys omitted later still take part in the comparison. Pass a constant.

**`useReference` writes to its ref during render**, not from an effect, so the current value is readable immediately — including by code that runs before the commit. That is what makes it safe inside a callback created in the same render.

**`useHandle` never throws on a missing handler.** With no handler, the returned function still exists and returns `null` at runtime while typed as the handler's return type. A missing handler therefore surfaces as an unexpected `null` somewhere downstream instead of an error at the call site.

```tsx
const onSelect = useHandle(props.onSelect); // stable identity for the component's lifetime
<ExpensiveChild onSelect={onSelect} />; // never re-renders because of this prop
```

## Lifecycle hooks

Six thin wrappers over `useEffect` / `useLayoutEffect` with an empty dependency array: `useOnMount`, `useOnMountLayout`, `useOnUnmount`, `useOnUnmountLayout`, plus the conditional pair `useEffectUntil` and `useLayoutEffectUntil`. The `Layout` variants run before paint — they block it, so use them only when the DOM must settle before the browser draws.

**The unmount pair captures its handler at mount.** `useOnUnmount(fn)` is `useEffect(() => fn, [])`, so `fn` is the closure from the first render forever. State read inside it yields mount-time values:

```tsx
const countRef = useReference(count);
useOnUnmount(() => save(countRef.current)); // reading `count` directly would save the mount-time value
```

**`useEffectUntil` stops permanently.** The effect returns a boolean; the first `true` sets an internal flag and no later dependency change ever runs it again — remounting the component is the only reset. It also does **not support cleanup**: the return value is consumed as the stop signal, so a returned function is never treated as a teardown and never runs. Anything needing cleanup belongs in a plain `useEffect`. `useLayoutEffectUntil` is the same contract before paint.

The dependency argument is optional, and omitting it means no dependency array at all — the effect then retries after **every** render until it succeeds. That is a useful polling shape when the retry is cheap, and an easy accident when it is not.

```tsx
useEffectUntil(() => {
  if (!containerRef.current) return false; // retry on the next dependency change
  initialize(containerRef.current);
  return true; // done — never runs again
}, [deps]);
```

## Timing and environment

**`useDebounce(callback, deps, ms, options)` is leading-edge by default** — `immediate` defaults to `true`, firing the callback immediately when idle and suppressing the trailing call. Pass `{ immediate: false }` for the trailing-edge behavior most debounce implementations default to. The options are read into a ref on the first render only, so changing them later has no effect. It returns `{ isIdle, cancel }`.

`useTimeout(callback, ms)` returns `{ isIdle, schedule, cancel }`; `schedule()` clears any pending timer first, making it a reschedule.

**`useWindowSize()` returns `{ width: 0, height: 0 }` on the first render** — the listener and the first measurement both happen in an effect. Every server render sees `{ 0, 0 }`, so branching on it directly produces hydration mismatches; gate on mount, or accept one corrective render.

`useVersion(callback?)` returns `[version, update]`, where `update` has a permanent identity and increments the counter after invoking the latest `callback`. Feed `version` to a child's `key` to force a remount, or to a dependency array to invalidate.
