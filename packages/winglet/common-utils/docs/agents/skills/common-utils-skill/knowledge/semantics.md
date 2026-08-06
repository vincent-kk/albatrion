# Semantics — what the type declarations cannot tell you

Organized by decision, not by module. Every claim here was read off `src/**` at the version this document ships with.

## Near-twin selection

### `equals` vs `stableEquals`

|                              | `equals(left, right, omit?)`                           | `stableEquals(left, right)` |
| ---------------------------- | ------------------------------------------------------ | --------------------------- |
| Circular references          | **stack overflow**                                     | safe (WeakMap-tracked)      |
| `Date`, `RegExp`, TypedArray | reference equality only                                | compared by value           |
| Symbol properties            | not compared                                           | compared                    |
| Non-enumerable properties    | not compared                                           | not compared                |
| Omit keys                    | third argument, `Set` or array, applied at every level | not supported               |
| Cost                         | the faster of the two                                  | roughly twice `equals`      |

Both treat `NaN` as equal to `NaN`. Reach for `equals` by default; switch to `stableEquals` the moment the data can carry a cycle or a built-in whose identity is not its value.

```typescript
// Ignore volatile keys at every nesting level, not just the top one.
equals(previous, next, ['updatedAt', 'requestId']);
```

### `clone` vs `cloneLite` vs `shallowClone`

|                     | `clone(target, maxDepth?)`                                                                                                                          | `cloneLite(target, maxDepth?)`     | `shallowClone(value)`         |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- | ----------------------------- |
| Handles             | primitives, plain objects, arrays, `Date`, `RegExp`, `Map`, `Set`, `Error`, ArrayBuffer family, `File`/`Blob`, symbol properties, custom prototypes | arrays and plain objects only      | arrays and plain objects only |
| Everything else     | type-specific handling                                                                                                                              | **returned by reference**          | returned as-is                |
| Circular references | safe (Map-tracked, structure preserved)                                                                                                             | **stack overflow**                 | not applicable                |
| Prototype chain     | preserved                                                                                                                                           | dropped — result is a plain object | preserved via spread          |

The `cloneLite` trap is not that it fails on a `Date`; it is that it _succeeds_ and hands back the very same `Date`, so a later mutation reaches the original. Both `clone` and `cloneLite` accept a depth bound, and both return nodes at or beyond that depth by reference — a bounded clone shares state by design.

### The three meanings of `Lite`

| Family                               | What `Lite` changes                      | Consequence                                                                                                 |
| ------------------------------------ | ---------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `differenceLite`, `intersectionLite` | `indexOf` linear scan instead of a `Set` | **equality changes from SameValueZero to `===`, so `NaN` never matches**; faster below roughly 100 elements |
| `cloneLite`                          | narrower type coverage                   | unsupported types pass through by reference; no cycle detection                                             |
| `minLite`, `maxLite`                 | arity, not algorithm                     | takes two scalars, whereas `min`/`max` take one array — the call shapes are not interchangeable             |

```typescript
min([3, 1, 2]); // 1   — array argument
minLite(3, 1); //  1   — two scalar arguments
```

### The four serializers

None of these produce JSON except the first. Reading the name alone will mislead.

| Export | Output | Use for | | ------------------------------------- | --------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | --------------------------------- | | `serializeNative` | `JSON.stringify` — it is a direct alias | actual JSON | | `serializeObject(object, omits?)` | `key:value` pairs joined by `                                                                            |`, own keys in **reverse** insertion order, nested objects rendered with `JSON.stringify` | cheap cache key for a flat object | | `serializeWithFullSortedKeys(object)` | flattened `path.to.key:value` pairs joined by `                                                          |`, keys sorted at every level | order-independent cache key | | `stableSerialize(input, omit?)` | short structural identity string; cycles become back-references; results memoized per object in a WeakMap | comparing structures that may be circular |

Only the last two are order-independent, and only `stableSerialize` survives a cycle.

### `countKey` vs `countObjectKey`

`countKey` counts every enumerable property including inherited ones; `countObjectKey` counts own enumerable properties. On an object literal they agree, which is exactly why the difference goes unnoticed until a prototype is involved.

### `scheduleMacrotask` vs `scheduleMacrotaskSafe`

|                             | `scheduleMacrotask`                            | `scheduleMacrotaskSafe`               |
| --------------------------- | ---------------------------------------------- | ------------------------------------- |
| Node                        | native `setImmediate`                          | native `setImmediate` — **identical** |
| Browser                     | `MessageChannel` via `MessageChannelScheduler` | `setTimeout`                          |
| Browser paint between tasks | not guaranteed                                 | guaranteed                            |
| Browser minimum delay       | none                                           | subject to the `setTimeout` clamp     |

The two differ only in a browser. Choose `Safe` when the queued work may run long and responsiveness outranks latency; choose the plain variant for framework-internal batching where the delay itself is the cost.

### `waitAndExecute` vs `waitAndReturn`

Both are `(fn, ms = 0)` and both take a _function_ — the difference is when it runs.

```typescript
await waitAndExecute(fn, 500); // wait 500 ms, then call fn — a delayed action
await waitAndReturn(fn, 500); // call fn now, resolve after 500 ms — a minimum duration
```

`waitAndReturn` is the one to use for "the spinner must show for at least 500 ms".

## Circular-reference safety matrix

| Safe                                       | Unsafe — recursion, so a cycle overflows the stack | Unsafe — iterative, so a cycle spins forever  |
| ------------------------------------------ | -------------------------------------------------- | --------------------------------------------- |
| `clone`, `stableEquals`, `stableSerialize` | `cloneLite`, `equals`, `merge`, `removeUndefined`  | `serializeWithFullSortedKeys`, `hasUndefined` |

The safe implementations track visited objects in a `Map`/`WeakMap`; the rest have no guard at all. The two iterative ones are the worse failure: they consume memory in a loop instead of failing fast. When input can come from user data or a graph structure, this table picks the function.

## Mutation and identity contracts

| Function                                                                                              | Contract                                                                                        |
| ----------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `merge(target, source)`                                                                               | **mutates and returns `target`**, recursively                                                   |
| `sortWithReference(source, reference)`                                                                | returns a new array — except with no `reference`, where it returns **the same array reference** |
| `median`, `sortObjectKeys`, `removeUndefined`, `transformKeys`, `transformValues`, all set operations | never mutate their inputs                                                                       |
| `removePrototype(object)`                                                                             | mutates in place, returns nothing                                                               |
| `clone`, `cloneLite`, `shallowClone`                                                                  | new value, except for nodes past `maxDepth` and types the function does not handle              |

`merge`'s rules, in the order the implementation applies them: an array source merges index-wise into an array target (**not** concatenated, and the target's surplus elements survive); a plain-object source merges recursively; otherwise the source value replaces the target's — except that a defined target value is never overwritten by `undefined`.

## Equality semantics across the library

| Comparison                                        | Functions                                                                                       |
| ------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| SameValueZero — `NaN` matches, `+0`/`-0` collapse | `unique`, `difference`, `intersection` (all `Set`-based)                                        |
| `===` — `NaN` never matches                       | `differenceLite`, `intersectionLite`, `primitiveArrayEqual`                                     |
| Structural, `NaN` matches                         | `equals`, `stableEquals`                                                                        |
| Reference identity for objects                    | `unique`, `sortWithReference` (`Map` keys) — use `uniqueBy`/`uniqueWith` for content comparison |

`uniqueBy` keeps the first occurrence of each key.

## Event loop and scheduling

Execution order, earliest first:

```
synchronous code
  → microtasks          scheduleMicrotask
  → next tick           scheduleNextTick   (Node: a microtask that then queues process.nextTick)
  → macrotasks          scheduleMacrotask / setImmediate / MessageChannel
  → setTimeout(…, 0)    scheduleMacrotaskSafe in browsers
  → paint
```

- `scheduleMicrotask` is `queueMicrotask` when available, otherwise `Promise.resolve().then(task)`.
- `scheduleNextTick` in Node is `Promise.resolve().then(() => process.nextTick(task))`, which lands _after_ pending I/O callbacks; it falls back to `setImmediate`, then to `setTimeout`.
- Every one of these bindings is resolved once when the module is first imported. Timer globals replaced later — a fake-timer library installed after import — will not be seen.
- The id returned by `scheduleMacrotask` is typed `number`, but in Node it is really the `Immediate` object `setImmediate` returns. Pass it back to `cancelMacrotask` and never do arithmetic on it.
- `scheduleCancelableMacrotask` returns a cancel function instead of an id, and guards with its own flag, so cancelling after the task has been dequeued is still safe.

`MessageChannelScheduler` backs browser macrotasks: tasks queued synchronously are batched, a microtask posts the batch through the channel, all of it runs in one macrotask, and a throwing task is isolated from the rest of its batch. `getInstance()` is a singleton whose options apply only on the first call; `destroyGlobalScheduler()` exists for test teardown.

## Rate limiting

Defaults differ between the two, which is the whole point of having both:

|                              | `leading` | `trailing` |
| ---------------------------- | --------- | ---------- |
| `debounce(fn, ms, options?)` | `false`   | `true`     |
| `throttle(fn, ms, options?)` | `true`    | `true`     |

| `leading` | `trailing` | Behavior                                                   | Fits                       |
| --------- | ---------- | ---------------------------------------------------------- | -------------------------- |
| `false`   | `true`     | run once the quiet period ends                             | search-as-you-type         |
| `true`    | `false`    | run immediately, ignore the rest of the window             | double-click protection    |
| `true`    | `true`     | run immediately, and again at the end if more calls arrive | scroll and resize handlers |

Both return a callable carrying `.execute()` and `.clear()`. Both discard the wrapped function's return value. `.execute()` clears the stored arguments as it runs, so a second consecutive `.execute()` does nothing, and it is a no-op before the first call.

Creating a debounced function inside a React render defeats it — each render produces a fresh timer. Build it once with `useMemo`, and call `.clear()` on unmount.

## The `getTrackableHandler` contract

```typescript
const handler = getTrackableHandler(origin, {
  preventConcurrent: true, // default
  initialState: { error: null as string | null },
  beforeExecute: (args, sm) => sm.update({ error: null }),
  afterExecute: (args, sm) => sm.update({ error: null }),
});
```

Execution order, and where each guarantee comes from:

1. When `preventConcurrent` is set and a call is in flight, the new call resolves `undefined` cast as `Result` — `origin` never runs, and nothing is notified.
2. `beforeExecute` runs **before** `pending` flips, so it observes `pending === false`. If it throws, the returned promise rejects, `origin` is skipped, and **`afterExecute` does not run** — it sits inside a `try` that has not been entered yet.
3. `pending` becomes `true`, subscribers are notified.
4. `origin` runs; its errors propagate to the caller untouched.
5. In `finally`: `afterExecute`, then `pending` becomes `false`, then subscribers are notified.

Subscribers are notified at exactly those two transitions. `stateManager.update()` does not publish on its own — updates made inside the hooks become visible because a notification follows them. Each update replaces the state object, so `.state` is a new reference every time.

The surface is `.pending`, `.state`, and `.subscribe(listener) => unsubscribe`. All three are non-enumerable and non-configurable: they survive property access but vanish from spreads and `Object.keys`. There is no `.loading`, no `.execute()`, no `.clear()`, and no `onError` option.

## Predicates that surprise

| Predicate           | Behavior worth knowing                                                                                                                                                 |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `isNumber(NaN)`     | `true` — it is a `typeof` check. For "a usable number", use `isInteger` or a finiteness check                                                                          |
| `isObject`          | `true` for arrays, `Date`, `Map`; `false` for functions and `null`                                                                                                     |
| `isPlainObject`     | only `{}`, `new Object()`, and `Object.create(null)`                                                                                                                   |
| `isPrimitiveObject` | reads as the opposite of what it does: it is `Object(value) === value`, so it is `true` for **any** object, including functions and arrays, and `false` for primitives |
| `isEmpty`           | falsy primitives (`0`, `''`, `false`, `NaN`, `0n`) are empty; functions never are; objects are empty when they have no own enumerable key                              |
| `isNil`             | loose `== null`, so it covers both `null` and `undefined`                                                                                                              |
| `isCloneable`       | a whitelist of type tags, not a question put to `clone`. `Blob` and `File` are excluded even though `clone` has a dedicated branch for them                            |

## Degenerate returns

Nothing here throws; each returns a value that a caller can easily mistake for data.

| Call                                               | Result                                                 |
| -------------------------------------------------- | ------------------------------------------------------ |
| `min([])` / `max([])`                              | `Infinity` / `-Infinity`                               |
| `range([])` / `median([])`                         | `NaN`                                                  |
| `chunk(array, 0)` or any non-positive-integer size | `[array]` — wrapped, not split                         |
| `at(array, outOfBounds)`                           | `undefined`, though the declared return type is `Type` |
| `convertMsFromDuration(anythingInvalid)`           | `0`                                                    |
| `getFirstKey({})`                                  | `undefined`                                            |

`range` is the spread between max and min — it is **not** lodash's sequence generator, despite the shared name.

`convertMsFromDuration` accepts one integer and one unit from `ms`, `s`, `m`, `h`, with surrounding whitespace tolerated. A decimal, an uppercase unit, a spelled-out unit, or two units in one string all yield `0`.

## Figures a signature does not show

Taken from the implementations' own benchmark notes:

- `clone` runs roughly 3× slower than a `JSON.parse(JSON.stringify(…))` round trip and about 20% faster than lodash `cloneDeep`, while covering far more types. Cycles add about 15%.
- `equals` is about 30% faster than lodash `isEqual`, and about twice as fast as `stableEquals`.
- `differenceLite` and `intersectionLite` are `O(n × m)` and win below roughly 100 elements, where allocating a `Set` costs more than it saves.
- `orderedMerge` switches strategy on combined input length: a linear scan under 20 elements, a `Set` at or above it.
- `factorial` and `fibonacci` memoize into module-level `Map`s that live for the process and are never evicted. They are the only exports that throw on invalid input — a non-integer or negative argument.
- `polynomialHash` derives from a 32-bit value, so entropy stops at about 7 base-36 characters no matter what length is requested.
- `Murmur3` is non-cryptographic. `Murmur3.hash(value, seed?)` is the one-shot form; an instance chains `.hash(…)` calls and reads out with `.result()`, accepting `string`, `ArrayBuffer`, or `Uint8Array`.
