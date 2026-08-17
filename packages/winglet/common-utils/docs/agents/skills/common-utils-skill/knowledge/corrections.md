# Corrections — names and behaviors that get misremembered

Each entry is a claim that looks right, is wrong, and often type-checks anyway. The first group collects call shapes that other libraries have made habitual — pattern-matching from them produces exactly these mistakes.

## Habits imported from other libraries

**`mapCacheFactory` / `weakMapCacheFactory`** → the exports are **`cacheMapFactory` / `cacheWeakMapFactory`**, from `@winglet/common-utils/lib`. The reversed word order reads naturally (a "map-cache factory"), and the wrong names resolve to `undefined` at runtime, not to a build error, when imported from the root barrel.

**`trackableHandler.loading`** → the property is **`.pending`**. There is no `.loading`, and because the real properties are non-enumerable, a typo here reads as `undefined` rather than failing.

**`withTimeout(fetchPromise, 5000)`** → `withTimeout` takes a **thunk**: `withTimeout(() => fetchPromise, 5000)`. It calls `fn()` inside `Promise.race`, so passing an already-created promise means the argument is invoked as a function — a `TypeError`. Note also that the losing timeout timer is not cancelled, so in Node the process stays alive for the remainder of `ms`.

**`convertMsFromDuration('1h30m')`** → returns **`0`**. The parser accepts exactly one integer and one unit (`/^\s*(\d+)\s*(ms|s|m|h)\s*$/`). Compound durations, decimals (`'1.5s'`), uppercase units (`'5S'`), and spelled-out units (`'5 sec'`) all yield `0` rather than throwing.

## Signatures with the arguments in the wrong order

**`waitAndExecute(ms, fn)`** → the real signature is **`waitAndExecute(fn, ms = 0)`**. Reversed arguments produce a promise that resolves to the number, because the implementation only calls its first argument when `typeof` says it is a function.

**`waitAndReturn(ms, value)`** → the real signature is **`waitAndReturn(fn, ms = 0)`**, and it takes a function, not a value. It calls `fn` **immediately** and resolves after `ms` — the minimum-duration pattern, the mirror image of `waitAndExecute`.

**`isClose(a, b, tolerance)`** → the third parameter is **`epsilon`, default `1e-8`**, and it scales: the test is `|a - b| <= epsilon * max(|a|, |b|, 1)`, not a fixed absolute window.

**`getRandomString(length)`** → the parameter is a **radix**, default `32`, not a length. The implementation is `Math.random().toString(radix).slice(2)`, so the output length varies and asking for `getRandomString(8)` yields a base-8 string.

**`cloneLite(target)` only** → `cloneLite` also accepts **`maxDepth`**, exactly like `clone`.

**`cloneLite` drops an own `__proto__` key** → it preserves it as an **own data property**; the clone keeps the input's prototype and sibling keys survive. Use `getDataProperty`/`setDataProperty`/`deleteDataProperty` (with the `isReservedName` predicate) for the same own-data semantics in your own code.

## Behaviors that are the opposite of the obvious reading

**`merge({tags:['a']}, {tags:['b']})` → `{tags:['a','b']}`** → the result is **`{tags:['b']}`**. Arrays merge index-wise through the same key walk used for objects, so `merge({a:[1,2]},{a:[3]})` gives `{a:[3,2]}` — index `0` is overwritten and the target's surplus elements survive. Nothing is concatenated.

**`forEachDual` stops at the shorter array** → it runs to the **longer** length, passing `undefined` for the exhausted side. It also supports early exit that no other iteration helper here has: returning `false` from the callback breaks the loop.

**`orderedMerge` merges two sorted arrays** → it is `orderedMerge(preferred: readonly string[], source: readonly string[]): string[]`, a **priority-ordered deduplicating union** built for JSON Schema property ordering. `preferred` keys come first in their given order, then the `source` keys not already present. Sorting is neither required nor performed.

**`differenceLite` / `intersectionLite` differ only in speed** → they also differ in **equality**. The full versions use a `Set` (SameValueZero, so `NaN` matches itself); the `Lite` versions use `indexOf` (`===`, so `NaN` never matches).

**`at(array, 1.7)` truncates to index 1** → truncation happens **only in the array-of-indices form**. `at(array, [1.7])` returns element `1`; `at(array, 1.7)` indexes the array with `1.7` and returns `undefined`. The declared return type is `Type` in both cases, so out-of-bounds `undefined` is invisible to the compiler.

**`hasUndefined` checks own property values** → it walks the whole structure **deeply**, arrays included, and returns `true` on the first `undefined` at any depth.

**`removeUndefined` drops undefined properties** → it also recurses, and it **compacts arrays**: an `undefined` element is removed rather than preserved as a hole, so indices shift.

**`getFirstKey` returns the first own key** → it uses `for...in`, so an inherited enumerable property can be returned first.

## Members that do not exist

**`trackableHandler.execute()` / `.clear()` / the `onError` option** → none exist. `.execute()` and `.clear()` are the `debounce`/`throttle` surface; confusing the two families is the usual source. A trackable handler exposes only `.pending`, `.state`, and `.subscribe`, and errors from `origin` simply propagate to the caller.

**`TYPE_TAGS` / `TIME_UNITS`** → neither symbol exists. `@winglet/common-utils/constant` exports the tags individually (`ARRAY_TAG`, `DATE_TAG`, `MAP_TAG`, …), the time constants individually (`MILLISECOND`, `SECOND`, `MINUTE`, `HOUR`, `DAY`), the SI and binary unit constants (`KILO`…`EXA`, `KILO_2`…`EXA_2`), and no-op function constants (`VOID_FUNCTION`, `IDENTITY_FUNCTION`, …). There is no aggregate object to index into.

**`polynomialHash` silently caps output at 7 characters** → the output is always exactly `length` characters, default `7`, zero-padded on the left. Requesting more than 7 is legal and returns a longer string; what caps at roughly 7 base-36 characters is the **entropy**, since the hash is a 32-bit value. Requesting fewer truncates, and discards entropy.

## Serializers that are not serializers

**`serializeObject` is `JSON.stringify` with error handling** → it emits `key:value` pairs joined by `|`, over own keys in **reverse** insertion order, with nested objects rendered by `JSON.stringify`. It also takes an undocumented second argument, `omits`. The plain `JSON.stringify` alias is **`serializeNative`**.

**`serializeWithFullSortedKeys` is `JSON.stringify` with sorted keys** → it emits flattened `path.to.key:value` pairs joined by `|`. The output is not JSON and cannot be parsed back.

**`stableSerialize` produces a stable JSON string** → it produces a short **structural identity string**, memoizes per object in a `WeakMap`, and represents cycles as back-references. It is a cache-key generator, not a serializer.

## Import paths

**`printError` from `/lib` or `/error`** → it lives at **`@winglet/common-utils/console`**, alongside `printWarning`.

**Error type guards** → `@winglet/common-utils/error` also exports `isAbortError`, `isInvalidTypeError`, and `isTimeoutError` next to the four classes.
